import { Search } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import BookOutlined from "@mui/icons-material/BookOutlined";
import Person from "@mui/icons-material/Person";
import Room from "@mui/icons-material/Room";
import { IconButton } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Fab from "@mui/material/Fab";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs from "dayjs";
import {
  MDBTabs,
  MDBTabsContent,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsPane,
} from "mdb-react-ui-kit";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Auth/UserProvider";
import Bookings from "./Bookings";
import CreateRoom from "./CreateRoom";
import Guests from "./Guests";
import Rooms from "./Rooms";

const Homepage = () => {
  const user = useUser();
  const navigate = useNavigate();
  const [fillActive, setFillActive] = useState("tab1");
  const [openSearch, setOpenSearch] = React.useState(false);
  const [checkInDate, setCheckInDate] = React.useState(dayjs());
  const [checkOutDate, setCheckOutDate] = React.useState(dayjs());
  const [amenities, setAmenities] = useState([]);
  const [roomType, setRoomType] = useState("");
  const [roomTypes, setRoomTypes] = useState([]);
  const [amenityNames, setAmenityNames] = useState([]);
  const [openCreateRoom, setOpenCreateRoom] = React.useState(false);
  const [isChanged, setIsChanged] = React.useState(false);
  const [searchBody, setSearchBody] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [isRooms, setIsRooms] = React.useState(true);
  const [isBookings, setIsBookings] = React.useState(false);
  const [isGuests, setIsGuests] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isBookingCreated, setIsBookingCreated] = React.useState(false);
  const currentDate = dayjs();

  const updateIsBookingCreate = (change) => {
    setIsBookingCreated(change);
  };

  const handleFillClick = (value) => {
    if (value === fillActive) {
      return;
    }
    if (value === "tab1") {
      setIsRooms(true);
      setIsGuests(false);
      setIsBookings(false);
    } else if (value === "tab2") {
      setIsRooms(false);
      setIsGuests(false);
      setIsBookings(true);
    } else {
      setIsRooms(false);
      setIsGuests(true);
      setIsBookings(false);
    }
    setFillActive(value);
  };

  const fetchAmenityNames = () => {
    fetch("http://localhost:8080/nexus/api/amenities/names", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    })
      .then((response) => {
        if (response.status === 200) {
          response.json().then((data) => {
            setAmenityNames(data);
          });
        } else if (response.status === 204) {
          console.log("No Records Found");
        }
      })
      .catch((message) => {
        console.log("Error Reading Names");
      });
  };

  const fetchRoomTypes = () => {
    fetch("http://localhost:8080/nexus/api/rooms/types", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    })
      .then((response) => {
        if (response.status === 200) {
          response.json().then((data) => {
            setRoomTypes(data);
          });
        } else if (response.status === 204) {
          console.log("No Records Found");
        }
      })
      .catch((message) => {
        console.log("Error Reading Names");
      });
  };

  const handleClickOpenSearch = () => {
    setOpenSearch(true);

    fetchAmenityNames();
    fetchRoomTypes();
  };

  const updateIsChanged = () => {
    setIsChanged(!isChanged);
    setIsChanged(!isChanged);
  }

  const handleCloseDialog = () => {
    setOpenSearch(false);
    setOpenCreateRoom(false);
    setIsChanged(!isChanged);
  };

  const handleAmenities = (e) => {
    const amenity = e.target.value;
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((item) => item !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleTypeChange = (event) => {
    setRoomType(event.target.value || "");
  };

  const handleOpenCreateRoom = () => {
    setOpenCreateRoom(true);
    setIsChanged(true);
  };

  const handleSendFilterData = () => {
    if (checkInDate && amenities && checkOutDate) {
      const requestBody = {
        checkin: checkInDate,
        checkout: checkOutDate,
        amenities: amenities,
        type: roomType,
      };
      setSearchBody(JSON.stringify(requestBody));
      setIsSearching(true);
    }
    handleCloseDialog();
  };

  const renderAddIcon = () => {
    if (user.role === "OWNER") {
      return (
        <>
          <Paper
            style={{
              justifyContent: "center",
              margin: "auto",
              py: 3,
              px: 20,
              mt: "auto",
              display: "flex",
              flexDirection: "column",
              minHeight: "10vh",
            }}>
            <IconButton onClick={handleOpenCreateRoom}>
              <Fab color="secondary" aria-label="edit">
                <AddIcon />
              </Fab>
              <Typography>Add Room</Typography>
            </IconButton>
          </Paper>
          <Divider inset="context" light={true} />
          <Divider inset="context" light={true} />
          <Divider inset="context" light={true} />
        </>
      );
    } else {
      return (
        <>
          <Paper
            style={{
              justifyContent: "center",
              margin: "auto",
              py: 3,
              px: 20,
              mt: "auto",
              display: "flex",
              flexDirection: "column",
              minHeight: "10vh",
            }}>
            <IconButton onClick={handleClickOpenSearch}>
              <Fab color="secondary" aria-label="edit">
                <Search />
              </Fab>
              <Typography> Filter Search</Typography>
            </IconButton>
          </Paper>
          <Divider inset="context" light={true} />
          <Divider inset="context" light={true} />
          <Divider inset="context" light={true} />
        </>
      );
    }
  };

  const renderCreateRoom = () => {
    if (user.role === "OWNER") {
      return <CreateRoom handleCloseDialog={handleCloseDialog} updateIsChanged={updateIsChanged} />;
    } else {
      return null;
    }
  };

  const renderCreateRoomDialog = () => {
    return (
      <Dialog
        open={openCreateRoom}
        onClose={handleCloseDialog}
        PaperProps={{
          style: {
            width: 900,
            height: 900,
          },
        }}>
        <DialogTitle>Create Room</DialogTitle>
        <DialogContent>{renderCreateRoom()}</DialogContent>
      </Dialog>
    );
  };

  useEffect(() => {
    if (!user.jwt) {
      navigate("/login");
    } else {
      setIsLoggedIn(true);
    }
  }, [isLoggedIn, navigate, user]);
  return (
    <>
      {openCreateRoom && renderCreateRoomDialog()}
      <Dialog
        open={openSearch}
        onClose={handleCloseDialog}
        sx={{ height: "65%", width: "75%", mx: "auto" }}>
        <DialogTitle>Filter Rooms</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DatePicker1", "DatePicker"]}>
              <DatePicker
                label="Check In"
                minDate={currentDate}
                value={dayjs(checkInDate)}
                onChange={(newValue) => setCheckInDate(dayjs(newValue))}
              />
              <DatePicker
                label="Check Out"
                minDate={checkInDate}
                value={dayjs(checkInDate)}
                onChange={(newValue) => setCheckOutDate(dayjs(newValue))}
              />
            </DemoContainer>
            <FormControl sx={{ width: "100%", mx: "auto" }}>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  minWidth: 300,
                  width: "100%",
                }}>
                <FormGroup>
                  {amenityNames.length > 0 ? (
                    amenityNames.map((item) => {
                      return (
                        <>
                          <FormControlLabel
                            key={item}
                            control={
                              <Checkbox
                                value={item}
                                checked={amenities.includes(item)}
                                onChange={(e) => handleAmenities(e)}
                              />
                            }
                            label={item}
                          />
                        </>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </FormGroup>
              </Box>
              <Box
                component="form"
                sx={{ display: "flex", flexWrap: "wrap" }}>
                <FormControl sx={{ m: 1, minWidth: 400 }}>
                  <InputLabel htmlFor="demo-dialog-native">
                    Room Type
                  </InputLabel>
                  <Select
                    native
                    value={roomType}
                    onChange={(e) => handleTypeChange(e)}
                    input={
                      <OutlinedInput
                        label="Room Type"
                        id="demo-dialog-native"
                      />
                    }>
                    <option aria-label="None" value="" />
                    {roomTypes.length > 0 ? (
                      roomTypes.map((item) => {
                        return (
                          <>
                            <option value={item}>{item}</option>
                          </>
                        );
                      })
                    ) : (
                      <></>
                    )}
                  </Select>
                </FormControl>
              </Box>
            </FormControl>
          </LocalizationProvider>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSendFilterData}>Apply Filter</Button>
        </DialogActions>
      </Dialog>
      <Box
        style={{
          justifyContent: "center",
        }}>
        <MDBTabs fill className="mb-3">
          {user && user.jwt ? (
            <>
              <MDBTabsItem>
                <MDBTabsLink
                  onClick={() => handleFillClick("tab1")}
                  active={fillActive === "tab1"}>
                  <Room />
                  Rooms
                </MDBTabsLink>
              </MDBTabsItem>
              <MDBTabsItem>
                <MDBTabsLink
                  onClick={() => handleFillClick("tab2")}
                  active={fillActive === "tab2"}>
                  <BookOutlined />
                  Bookings
                </MDBTabsLink>
              </MDBTabsItem>
              {user.role === "MANAGER" ||
                user.role === "OWNER" ||
                user.role === "CLERK" ? (
                <>
                  <MDBTabsItem>
                    <MDBTabsLink
                      onClick={() => handleFillClick("tab3")}
                      active={fillActive === "tab3"}>
                      <Person />
                      Guests
                    </MDBTabsLink>
                  </MDBTabsItem>
                </>
              ) : (
                <></>
              )}
            </>
          ) : (
            <></>
          )}
        </MDBTabs>

        <MDBTabsContent>
          <MDBTabsPane show={fillActive === "tab1"}>
            <Box
              style={{
                justifyContent: "center",
              }}>
              {renderAddIcon()}
              <Rooms
                isChanged={isChanged}
                isSearching={isSearching}
                searchBody={searchBody}
                isRooms={isRooms}
                isLoggedIn={isLoggedIn}
                isBookingCreated={isBookingCreated}
                updateIsBookingCreated={updateIsBookingCreate}
              />
            </Box>
          </MDBTabsPane>
          <MDBTabsPane show={fillActive === "tab2"}>
            <Bookings isBookings={isBookings} isLoggedIn={isLoggedIn} />
          </MDBTabsPane>
          <MDBTabsPane show={fillActive === "tab3"}>
            <Guests isGuests={isGuests} isLoggedIn={isLoggedIn} />
          </MDBTabsPane>
        </MDBTabsContent>
      </Box>
    </>
  );
};

export default Homepage;
