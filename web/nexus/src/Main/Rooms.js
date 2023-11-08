import BedIcon from "@mui/icons-material/Bed";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoneyIcon from "@mui/icons-material/Money";
import AspectRatio from "@mui/joy/AspectRatio";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CardOverflow from "@mui/joy/CardOverflow";
import Divider from "@mui/joy/Divider";
import Typography from "@mui/joy/Typography";
import { Box, IconButton } from "@mui/material";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useUser } from "../Auth/UserProvider";
import Availability from "../Dashboard/Availability";
import MySnack from "../util/MySnack";

import EditRoom from "./EditRoom";

export default function Rooms({
  isChanged,
  isSearching,
  searchBody,
  isRooms,
  isLoggedIn,
  updateIsBookingCreated,
  isBookingCreated,
}) {
  const user = useUser();
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState();
  const [openCreateBooking, setOpenCreateBooking] = React.useState(false);
  const [openEditRoom, setOpenEditRoom] = React.useState(false);
  const [checkInDate, setCheckInDate] = React.useState(dayjs());
  const [checkOutDate, setCheckOutDate] = React.useState(dayjs());
  const [openAvailability, setOpenAvailability] = React.useState(false);
  const [current, setCurrent] = React.useState();
  const currentDate = dayjs();
  const [bookingAdded, setBookingAdded] = React.useState(false);
  const [isEdited, setIsEdited] = React.useState(false);
  const [notFound, setNotFound] = React.useState(false);
  const [unauthorized, setUnauthorized] = React.useState(false);
  const [hasNoImmediateBooking, setHasNoImmediateBooking] = React.useState(false);

  const handleClickOpenBooking = (id) => {
    setRoomId(id);
    setBookingAdded(false);
    setOpenCreateBooking(true);
  };

  const handleCloseDialog = () => {
    setOpenCreateBooking(false);
    setOpenEditRoom(false);
    setOpenAvailability(false);
    setBookingAdded(false);
  };

  const handleClose = () => {
    setBookingAdded(false);
    setUnauthorized(false);
    setNotFound(false);
    setIsEdited(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetch("http://localhost:8080/nexus/api/rooms/rooms", {
          headers: {
            "Content-Type": "application/json",
          },
          method: "GET",
        })
          .then((response) => {
            if (response.status === 200) {
              response.json().then((data) => {
                setRooms(data);
              });
            } else if (response.status === 204) {
              setNotFound(true);
            }
          })
          .catch((message) => {
            console.log("Error Reading Response");
          });
      } catch (error) {
        console.log("Error Reading Rooms");
      }
    };

    const searchData = () => {
      if (searchBody) {
        const requestBody = JSON.parse(searchBody);
        try {
          fetch("http://localhost:8080/nexus/api/rooms/search", {
            headers: {
              "Content-Type": "application/json",
            },
            method: "post",
            body: JSON.stringify(requestBody),
          })
            .then((response) => {
              if (response.status === 200) {
                response.json().then((data) => {
                  setRooms(data);
                });
              } else if (response.status === 204) {
                setNotFound(true);
              }
            })
            .catch((message) => {
              console.log("Error Reading Response");
            });
        } catch (error) {
          console.log("Error Reading Rooms");
        }
      }
    };

    if (user && isLoggedIn) {
      if (isSearching) {
        searchData();
      } else {
        fetchData();
      }
    }
  }, [isChanged, user, isSearching, searchBody, isLoggedIn, isEdited]);

  const handleCheckoutDate = async (date) => {
    setCheckOutDate(dayjs(date).toDate());
    await checkClash();
  }

  const checkClash = async () => {
    const requestBody = {
      checkin: checkInDate,
      checkout: checkOutDate,
    };
    try {
      await fetch("http://localhost:8080/nexus/api/users/check-clash/" + user.jwt, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "put",
        body: JSON.stringify(requestBody),
      })
        .then((response) => {
          if (response.status === 200) {
            response.json().then((data) => {
              if (data === true) {
                setHasNoImmediateBooking(true);
              } else if (data === false) {
                setHasNoImmediateBooking(false);
              }
            });
          }
        })
        .catch((message) => {
          console.log("Error Reading Response: " + message);
        });
    } catch (error) {
      console.log("Error Checking User Booking Clashes: " + error);
    }
  };

  const handleImageClick = (imageId) => {
    setRoomId(imageId);
  };

  const deleteRoom = async (roomId) => {
    if (user.role === "OWNER") {
      const reqBody = {
        id: roomId,
      };
      await fetch("http://localhost:8080/nexus/api/rooms/delete/" + user.jwt, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "delete",
        body: JSON.stringify(reqBody),
      })
        .then((response) => {
          if (response.status === 200) {
            response.json().then((data) => {
              if (data === false) {
                setRooms((prevRooms) =>
                  prevRooms.filter((room) => room.id !== roomId)
                );
              }
            });
          } else if (response.status === 401) {
            setUnauthorized(true);
          }
        })
        .catch((message) => {
          console.log("Error Occurred When Deleting Booking");
        });
    } else {
      setUnauthorized(true);
    }
  };

  const editRoom = (id) => {
    if (user.role === "OWNER") {
      setOpenEditRoom(true);
      setRoomId(id);
    }
  };

  const renderActionButtons = (room) => {
    if (user.role === "OWNER") {
      return (
        <>
          <CardContent orientation="horizontal">
            <IconButton
              aria-label="delete"
              size="large"
              onClick={() => deleteRoom(room.id)}>
              <DeleteIcon fontSize="inherit" />
            </IconButton>
            <Divider orientation="vertical" />
            <IconButton
              aria-label="delete"
              size="large"
              onClick={() => editRoom(room.id)}>
              <EditIcon fontSize="inherit" />
            </IconButton>
          </CardContent>
        </>
      );
    } else if (user.role === "GUEST") {
      return (
        <>
          <CardContent orientation="horizontal">
            <Link>
              <Chip
                label="Book Reservation"
                color="warning"
                variant="outlined"
                icon={<BookOnlineIcon />}
                onClick={() => handleClickOpenBooking(room.id)}
              />
            </Link>
            <Link>
              <Chip
                label="Check Availability"
                color="info"
                variant="outlined"
                icon={<CalendarMonth />}
                onClick={() => handleAvailabilityClick(room)}
              />
            </Link>
          </CardContent>
        </>
      );
    } else if (user.role === "CLERK" || user.role === "MANAGER") {
      return (
        <>
          <CardContent orientation="horizontal">
            <Typography
              level="body3"
              sx={{ fontWeight: "md", color: "text.secondary" }}>
              CURRENTLY {room.status}
            </Typography>
            <Divider orientation="vertical" />
            <Link>
              <Chip
                label="Check Availability"
                color="info"
                variant="outlined"
                icon={<CalendarMonth />}
                onClick={() => handleAvailabilityClick(room)}
              />
            </Link>
          </CardContent>
        </>
      );
    }
  };

  const handleSendBookingData = async () => {
    if (checkInDate && roomId && checkOutDate) {
      const requestBody = {
        checkin: checkInDate,
        checkout: checkOutDate,
      };
      const availability = await fetch("http://localhost:8080/nexus/api/rooms/confirmation/" + roomId, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "post",
        body: JSON.stringify(requestBody),
      });

      const isAvailable = await availability.json();

      if (isAvailable) {
        const dataToSend = {
          checkin: checkInDate,
          checkout: checkOutDate,
          roomId: roomId,
        };
        axios
          .post(
            "http://localhost:8080/nexus/api/bookings/create/" + user.jwt,
            dataToSend
          )
          .then((response) => {
            if (response.status === 200) {
              console.log("Booking Sent");
              setBookingAdded(true);
              if (isBookingCreated === false) {
                updateIsBookingCreated(true);
              } else {
                updateIsBookingCreated(false);
              }
            }
          })
          .catch((error) => {
            console.log("Error Reading Rooms");
          });
      } else {
        setNotFound(true);
      }
    }
    handleCloseDialog();
  };

  const renderCreateBooking = () => {
    return (
      <Dialog
        open={openCreateBooking}
        onClose={handleCloseDialog}
        sx={{ height: "65%", width: "75%", mx: "auto" }}>
        <DialogTitle>Book Reservation</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DatePicker", "DatePicker"]}>
              <DatePicker
                label="Check In"
                minDate={currentDate}
                value={dayjs(checkInDate)}
                onChange={(newValue) =>
                  setCheckInDate(dayjs(newValue).toDate())
                }
              />
              <DatePicker
                label="Check Out"
                minDate={dayjs(checkInDate)}
                value={dayjs(checkInDate)}
                onChange={(newValue) =>
                  handleCheckoutDate(dayjs(newValue).toDate())
                }
              />
            </DemoContainer>
          </LocalizationProvider>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={() => handleSendBookingData()}>Book</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderAvailability = () => {
    if (current) {
      return (
        <Dialog
          open={openAvailability}
          onClose={handleCloseDialog}
          PaperProps={{
            style: {
              width: "100%",
              margin: "auto",
            },
          }}>
          <DialogTitle>Available Dates</DialogTitle>
          <DialogContent>
            <Availability room={current.id} />
          </DialogContent>
        </Dialog>
      );
    }
  };

  const handleAvailabilityClick = (room) => {
    setCurrent(room);
    setOpenAvailability(true);
  };
  const renderEditRoomDialog = () => {
    return (
      <Dialog
        open={openEditRoom}
        onClose={handleCloseDialog}
        PaperProps={{
          style: {
            width: "100%",
            margin: "auto",
          },
        }}>
        <DialogContent>{renderEditRoom()}</DialogContent>
      </Dialog>
    );
  };

  const changeIsEdited = (change) => {
    setIsEdited(change);
  };

  const renderEditRoom = () => {
    if (user.role === "OWNER") {
      return (
        <EditRoom
          handleCloseDialog={handleCloseDialog}
          changeIsEdited={changeIsEdited}
          isEdited={isEdited}
          id={roomId}
        />
      );
    } else {
      return null;
    }
  };

  return (
    <Box
      style={{
        display: "flex",
        justifyContent: "center",
      }}>
      {rooms && isRooms ? (
        <ImageList gap={40} sx={{ width: 1, height: 1 }}>
          {rooms.map((item) => {
            const url = process.env.PUBLIC_URL + "/src/" + item.resource;
            return (
              <>
                <ImageListItem key={item.id}>
                  <Card
                    variant="outlined"
                    sx={{ height: "65%", minWidth: "75%", mx: "auto" }}>
                    <CardOverflow >
                      <AspectRatio ratio="2">
                        <img
                          src={url}
                          srcSet="https://images.unsplash.com/photo-1532614338840-ab30cf10ed36?auto=format&fit=crop&w=318&dpr=2 2x"
                          loading="lazy"
                          alt=""
                          onClick={handleImageClick}
                        />
                      </AspectRatio>
                    </CardOverflow>
                    <CardContent>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={item.type}
                          color="primary"
                          variant="outlined"
                          icon={<BedIcon />}
                        />
                        <Chip
                          label={"R" + item.rate + ".00"}
                          color="success"
                          variant="outlined"
                          icon={<MoneyIcon />}
                        />
                      </Stack>

                      <Stack direction="row" spacing={1}>
                        {item.amenities && (item.amenities.map((amenity) => {
                          return (<>
                            <Chip
                              label={amenity}
                              color="success"
                              icon={<MoneyIcon />}
                            /></>)

                        }))}

                      </Stack>

                      <Typography level="body2" sx={{ mt: 0.5 }}></Typography>
                    </CardContent>
                    <CardOverflow
                      variant="soft"
                      sx={{ bgcolor: "background.level1" }}>
                      <Divider inset="context" />
                      {renderActionButtons(item)}
                    </CardOverflow>
                  </Card>
                </ImageListItem>
              </>
            );
          })}
        </ImageList>
      ) : (
        <>
          <Typography level="body2" sx={{ mt: 0.5 }}>
            No Rooms Found
          </Typography>
        </>
      )}
      <MySnack
        alive={bookingAdded} handleClose={handleClose} message="Booking Sent"
      />
      <MySnack alive={notFound}
        handleClose={handleClose} message="Room Not Available On Selected Dates Or You Have Booked The Dates Already." />

      <MySnack open={isChanged} message="New Room Added" handleClose={handleClose} />
      <MySnack alive={unauthorized} handleClose={handleClose}
        message="Not Authorized to Perform Attempted Action!!" />
      <MySnack alive={hasNoImmediateBooking} handleClose={handleClose}
        message="Cannot Book The Same Dates Twice!!" />

      {openAvailability && renderAvailability()}
      {openEditRoom && renderEditRoomDialog()}
      {openCreateBooking && renderCreateBooking()}
    </Box>
  );
}
