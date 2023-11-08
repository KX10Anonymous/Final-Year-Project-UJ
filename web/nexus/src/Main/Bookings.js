import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FaceIcon from "@mui/icons-material/Face";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/joy/Typography";
import { styled } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import "../App.css";
import { useUser } from "../Auth/UserProvider";
import Review from "../Checkout/Review";
import MySnack from "../util/MySnack";
import Timer from "./Countdown/Timer";
import Availability from "../Dashboard/Availability";

const Bookings = ({ isBookings, isLoggedIn }) => {
  const [bookings, setBookings] = useState([]);
  const [checkInDate, setCheckInDate] = useState(dayjs());
  const [checkOutDate, setCheckOutDate] = useState(dayjs());
  const [openEditBooking, setOpenEditBooking] = useState(false);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [notFound, setNotFound] = React.useState(false);
  const [isAvailable, setIsAvailable] = React.useState(false);
  const [booking, setBooking] = React.useState(undefined);
  const [bookingDate, setBookingDate] = React.useState(false);
  const [checkedIn, setCheckedIn] = React.useState(false);
  const [changed, setChanged] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [openAvailability, setOpenAvailability] = React.useState(false);
  const [roomId, setRoomId] = React.useState();
  const [isChanged, setIsChanged] = React.useState(false);
  const user = useUser();
  const url = process.env.PUBLIC_URL + "/src/booking.jpg";

  useEffect(() => {
    const fetchBookings = async () => {
      if (
        user.role === "CLERK" ||
        user.role === "GUEST" ||
        user.role === "MANAGER" ||
        user.role === "OWNER"
      ) {
        await fetch(
          "http://localhost:8080/nexus/api/bookings/bookings/" + user.jwt,
          {
            headers: {
              "Content-Type": "application/json",
            },
            method: "GET",
          }
        )
          .then((response) => {
            if (response.status === 200) {
              response.json().then((data) => {
                setBookings(data);
              });
            } else if (response.status === 204) {
              console.log("No Records Found");
            }
          })
          .catch((message) => {
            console.log("Error Reading Bookings");
          });
      }
    };
    if (user !== null && isLoggedIn) {
      fetchBookings();
    }
  }, [user, isLoggedIn, isBookings, changed]);

  const handleCloseDialog = () => {
    setOpenEditBooking(false);
    setConfirmDelete(false);
  };

  const handleAvailabilityClose = () => {
    setOpenAvailability(false);
  };

  const handleDeleteClick = (bookingId) => {
    setBookingId(bookingId);
    setConfirmDelete(true);
  }

  const renderActionButtons = (booking) => {
    if (
      user.role === "GUEST" ||
      user.role === "CLERK" ||
      user.role === "MANAGER"
    ) {
      return (
        <>
          <Grid item>
            <IconButton
              aria-label="delete"
              size="large"
              onClick={() => handleDeleteClick(booking.id)}>
              <DeleteIcon fontSize="inherit" />
            </IconButton>
          </Grid>

          <Grid item>
            <IconButton
              aria-label="delete"
              size="large"
              onClick={() => openDialog(booking)}>
              <EditIcon fontSize="inherit" />
            </IconButton>
          </Grid>

          {(user.role === "CLERK" || user.role === "MANAGER") && (
            <Grid item>
              {!booking.checkedIn && (
                <>
                  <Chip
                    label="Check In"
                    color="success"
                    onClick={() => checkIn(booking.id)}
                  />
                </>
              )}
              {booking.checkedIn && (
                <>
                  <Chip
                    label="Check Out"
                    variant="outlined"
                    color="danger"
                    onClick={() => checkOut(booking.id)}
                  />
                </>
              )}
            </Grid>
          )}
        </>
      );
    } else {
      return null;
    }
  };

  const openDialog = (pBooking) => {
    setOpenEditBooking(true);
    setBookingId(pBooking.id);
    setBooking(pBooking);
    setRoomId(pBooking.roomId);
    setCheckInDate(pBooking.checkin);
    setCheckOutDate(pBooking.checkout);
  };
  const updateBookings = (checkedinBooking) => {
    setBookings((prevBookings) => {
      const updatedBookings = prevBookings.map((booking) =>
        booking.id === checkedinBooking.id ? checkedinBooking : booking
      );
      return updatedBookings;
    });
  };

  const checkIn = async (bookingId) => {
    try {
      const dateVerifyResponse = await fetch("http://localhost:8080/nexus/api/bookings/date/" + bookingId, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "get",
      });

      if (dateVerifyResponse.status === 200) {
        const verifyData = await dateVerifyResponse.json();
        if (user.role === "CLERK" || user.role === "MANAGER") {
          if (verifyData === true) {
            try {
              const reqBody = {
                id: bookingId,
              };
              const response = await fetch(
                "http://localhost:8080/nexus/api/bookings/checkin/" + user.jwt,
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                  method: "put",
                  body: JSON.stringify(reqBody),
                }
              );
              console.log(response);
              setChanged(!changed);
            } catch (error) {
              console.log("");
            }
            setCheckedIn(true);
          } else {
            setBookingDate(true);
          }
        }
      }
    } catch (error) {
      console.log("Error Occured When Checking In: " + error);
    }
  };

  const closeInvoice = () => {
    setOpenCheckout(false);
  };

  const checkOut = async (bookingId) => {
    if (user.role === "CLERK" || user.role === "MANAGER") {
      const reqBody = {
        id: bookingId,
      };
      await fetch(
        "http://localhost:8080/nexus/api/bookings/checkout/" + user.jwt,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "put",
          body: JSON.stringify(reqBody),
        }
      )
        .then((response) => {
          if (response.status === 200) {
            response.json().then((data) => {
              setBookings((prevBookings) =>
                prevBookings.filter((booking) => booking.id !== data.id)
              );
              setBookingId(data.id);
              setOpenCheckout(true);
            });
          } else if (response.status === 401) {
            setUnauthorized(true);
          }
        })
        .catch((message) => {
          console.log("Error Occured When Checking Out");
        });
    } else {
      setUnauthorized(true);
    }
  };

  const handleClose = () => {
    setUnauthorized(false);
    setNotFound(false);
    setBookingDate(false);
    setCheckedIn(false);
    setIsAvailable(false);
    setIsChanged(false);  
  };

  const deleteBooking = async () => {
    if (
      user.role === "CLERK" ||
      user.role === "GUEST" ||
      user.role === "MANAGER"
    ) {
      const reqBody = {
        id: bookingId,
      };
      await fetch(
        "http://localhost:8080/nexus/api/bookings/delete/" + user.jwt,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "delete",
          body: JSON.stringify(reqBody),
        }
      )
        .then((response) => {
          if (response.status === 200) {
            response.json().then((data) => {
              setChanged(!changed);
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
    handleCloseDialog();
  };

  const editBooking = async (roomId) => {
    const requestBody = {
      checkin: checkInDate,
      checkout: checkOutDate,
      bookingId: bookingId,
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
      if (checkInDate && checkOutDate && bookingId) {
        if (
          user.role === "CLERK" ||
          user.role === "GUEST" ||
          user.role === "MANAGER"
        ) {
          const reqBody = {
            id: bookingId,
            checkin: checkInDate,
            checkout: checkOutDate,
          };
          setOpenEditBooking(false);
          await fetch("http://localhost:8080/nexus/api/bookings/edit/" + user.jwt, {
            headers: {
              "Content-Type": "application/json",
            },
            method: "put",
            body: JSON.stringify(reqBody),
          })
            .then((response) => {
              if (response.status === 200) {
                response.json().then((booking) => {
                  setIsChanged(true);
                  updateBookings(booking);
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
      }
    } else {
      setIsAvailable(true);
    }
  };

  const editBookingDialog = () => {
    return (
      <Dialog
        open={openEditBooking}
        onClose={handleCloseDialog}
        sx={{ height: "65%", width: "75%", mx: "auto" }}>
        <DialogTitle>Edit Booking</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DatePicker", "DatePicker"]}>
              <DatePicker
                label="Check In"
                minDate={dayjs()}
                value={dayjs(checkInDate)}
                onChange={(newValue) =>
                  setCheckInDate(dayjs(newValue).toDate())
                }
              />
              <DatePicker
                label="Check Out"
                value={dayjs(checkInDate)}
                minDate={dayjs(checkInDate)}
                onChange={(newValue) =>
                  setCheckOutDate(dayjs(newValue).toDate())
                }
              />
            </DemoContainer>
          </LocalizationProvider>
        </DialogContent>

        <DialogActions>

          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={() => setOpenAvailability(true)}>Available Dates</Button>
          <Button onClick={() => editBooking(booking.roomId)}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderAvailability = () => {
    if (roomId) {
      return (
        <Dialog
          open={openAvailability}
          onClose={handleAvailabilityClose}
          PaperProps={{
            style: {
              width: "70%",
              margin: "auto",
            },
          }}>
          <DialogTitle>Alternative Available Dates.</DialogTitle>
          <DialogContent>
            <Availability room={roomId} />
          </DialogContent>
        </Dialog>
      );
    }
  };

  const renderCheckout = () => {
    if (user.role === "CLERK") {
      return (
        <Dialog
          open={openCheckout}
          onClose={handleCloseDialog}
          sx={{ height: "65%", width: "75%", mx: "auto" }}>
          <DialogTitle>Invoice</DialogTitle>
          <DialogContent>
            <Review id={bookingId} />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeInvoice}>Alternative Dates</Button>
            <Button onClick={closeInvoice}>Close</Button>
            <Button onClick={closeInvoice}>Checkout</Button>
          </DialogActions>
        </Dialog>
      );
    } else {
      return null;
    }
  };

  const Img = styled("img")({
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
  });

  return (
    <>
      {user && user.jwt && bookings && isBookings ? (
        <div>
          {bookings.map((booking) => (
            <>
              <Paper
                key={booking.id}
                sx={{
                  p: 2,
                  margin: "auto",
                  maxWidth: "70%",
                  flexGrow: 1,
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark" ? "#1AFF27" : "#fffc",
                }}>
                <Grid container spacing={2}>
                  <Grid item>
                    <ButtonBase sx={{ width: 228, height: 228 }}>
                      <Img alt="complex" src={url} />
                    </ButtonBase>
                  </Grid>

                  <Grid item xs={12} sm container>
                    <Grid item xs container direction="column" spacing={10}>
                      <Grid item xs>
                        <Typography
                          gutterBottom
                          variant="subtitle1"
                          component="div">
                          {booking.type}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <Chip
                            color="info"
                            icon={<FaceIcon />}
                            label={booking.guest}
                            variant="outlined"
                          />
                        </Typography>
                        <Divider />
                        <Divider />
                        <Divider />
                        <Divider />
                        <Typography variant="body2" color="info">
                          Check In:
                          <Chip
                            color="info"
                            label={dayjs(booking.checkin).format("YYYY-MM-DD")}
                            variant="outlined"
                          />
                        </Typography>
                        <Divider />
                        <Divider />
                        <Divider />
                        <Divider />
                        <Typography variant="body2" color="info">
                          Check Out:
                          <Chip
                            color="info"
                            label={dayjs(booking.checkout).format("YYYY-MM-DD")}
                            variant="outlined"
                          />
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Stack direction="row" spacing={1}>
                          {!booking.checkedIn && (
                            <>
                              <Timer bookingTargetDate={booking.expiration} />
                            </>
                          )}
                          {booking.checkedIn && (
                            <>
                              <Timer bookingTargetDate={booking.checkout} />
                            </>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                    {renderActionButtons(booking)}
                  </Grid>
                </Grid>
              </Paper>
              <Divider />
              <Divider />
              <Divider />
              <Divider />
            </>
          ))}
          <>
          {renderAvailability()}
            <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)}>
              <ModalDialog variant="outlined" role="alertdialog">
                <DialogTitle>
                  <WarningRoundedIcon />
                  Cancel Booking
                </DialogTitle>
                <Divider />
                <DialogContent>
                  Are you sure you want to cancel this booking?
                </DialogContent>
                <DialogActions>
                  <Button variant="solid" color="danger" onClick={() => deleteBooking()}>
                    Continue
                  </Button>
                  <Button variant="plain" color="neutral" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                </DialogActions>
              </ModalDialog>
            </Modal>
          </>
          {openEditBooking && editBookingDialog()}
          {openCheckout && renderCheckout()}
          <MySnack alive={notFound}
            handleClose={handleClose} message="Select Different Dates" />
          <MySnack alive={unauthorized}
            handleClose={handleClose} message="Not Authorized To Make Attempted Action." />
          <MySnack alive={bookingDate}
            handleClose={handleClose} message="Booking Date Has Not Arrived!!" />
          <MySnack alive={checkedIn}
            handleClose={handleClose} message="Guest Has Been Checked In." />
          <MySnack alive={isAvailable}
            handleClose={handleClose} message="Selected Dates Are Not Available." />
            <MySnack alive={isChanged}
            handleClose={handleClose} message="Changes Saved!." />
        </div>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary">
            No Bookings
          </Typography>
        </>
      )}
    </>
  );
};

export default Bookings;
