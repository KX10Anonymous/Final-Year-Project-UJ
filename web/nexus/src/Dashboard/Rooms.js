import CalendarMonth from "@mui/icons-material/CalendarMonth";
import Delete from "@mui/icons-material/DeleteOutlined";
import MoneyIcon from "@mui/icons-material/Money";
import FaceIcon from "@mui/icons-material/Face";
import Save from "@mui/icons-material/Save";
import Box from "@mui/joy/Box";
import CircularProgress from "@mui/joy/CircularProgress";
import Chip from "@mui/material/Chip";
import OutlinedInput from "@mui/material/OutlinedInput";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import Divider from "@mui/material/Divider";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/joy/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import * as React from "react";
import { useUser } from "../Auth/UserProvider";
import Grid from "@mui/material/Grid";
import dayjs from "dayjs";
import MySnack from "../util/MySnack";

const theme = createTheme();

export default function Rooms({ isRooms }) {
  const [rooms, setRooms] = React.useState([]);
  const [bookings, setBookings] = React.useState([]);
  const [isChanged, setIsChanged] = React.useState(false);
  const [amenity, setAmenity] = React.useState("");
  const [roomId, setRoomId] = React.useState("");
  const [isBookings, setIsBookings] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const user = useUser();
  const [amenityAdded, setAmenityAdded] = React.useState(false);
  const [amenityDeleted, setAmenityDeleted] = React.useState(false);
  
  React.useEffect(() => {
    const fetchReport = async () => {
      if (user.role === "MANAGER" || user.role === "OWNER") {
        await fetch("http://localhost:8080/nexus/api/data/rooms/" + user.jwt, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "get",
        })
          .then((response) => {
            if (response.status === 200) {
              response.json().then((data) => {
                setRooms(data);
              });
            }
          })
          .catch((message) => {
            console.log("Error Reading Rooms");
          });
      }
    };
    if (isRooms) {
      fetchReport();
    }
  }, [user, isRooms, isChanged]);


  const fetchRoomBookings = async (roomId) => {
    setIsBookings(true);
    if (user.role === "MANAGER" || user.role === "OWNER") {
      const reqBody = {
        id: roomId
      }
      await fetch("http://localhost:8080/nexus/api/bookings/room/" + user.jwt, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "put",
        body: JSON.stringify(reqBody),
      })
        .then((response) => {
          if (response.status === 200) {
            response.json().then((data) => {
              setBookings(data);
            });
          }
        })
        .catch((message) => {
          console.log("Error Reading Bookings");
        });
    }
  };

  const setAmenityOnChange = (e) => {
    setAmenity(e.target.value);
  };

  const handleClose = () => {
    setAmenityAdded(false);
    setAmenityDeleted(false);
  }

  const handleAmenityChange = (id) => {
    if (user.role === "OWNER" || user.role === "MANAGER") {
      if (amenity) {
        const reqBody = {
          roomId: id,
          amenity: amenity,
        };
        fetch("http://localhost:8080/nexus/api/rooms/addAmenity/" + user.jwt, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "put",
          body: JSON.stringify(reqBody),
        })
          .then((response) => {
            if (response.status === 200) {
              response.json().then((data) => {
                setIsChanged(!isChanged);
                setAmenityAdded(true);
              });
            } else if (response.status === 401) {
              alert("Attempted Action Not Authorized");
            }
          })
          .catch((message) => {
            console.log("Error Occurred When Deleting Booking ");
          });
      }
    }
    setAmenity("");
  };

  const removeAmenity = async () => {
    setOpenDelete(false);
    if (user.role === "OWNER") {
      const reqBody = {
        roomId: roomId,
        amenity: amenity,
      };
      await fetch(
        "http://localhost:8080/nexus/api/rooms/deleteAmenity/" + user.jwt,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "put",
          body: JSON.stringify(reqBody),
        }
      )
        .then((response) => {
          response.json().then((data) => {
            setIsChanged(!isChanged);
            setAmenityDeleted(true);
          });
        })
        .catch((message) => {
          console.log("Error Occurred When Deleting Booking");
        });
    } 
  };


  const handleAmenityDelete = (amenity, id) => {
    setAmenity(amenity);
    setRoomId(id);
    setOpenDelete(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Table size="large">
          <TableHead>
            <TableRow>
              <TableCell><Typography>Room Number</Typography></TableCell>
              <TableCell><Typography>Room Status</Typography></TableCell>
              <TableCell><Typography>Room Type</Typography></TableCell>
              <TableCell>
                <Typography>
                  <CalendarMonth />
                  Current Bookings</Typography>
              </TableCell>
              <TableCell>
                <Typography>
                  <MoneyIcon />
                  Income Generated
                </Typography>
              </TableCell>
              <TableCell>
                <Typography>
                  <CalendarMonth />
                  Visits
                </Typography>
              </TableCell>
              <TableCell><Typography>Total Bookings</Typography></TableCell>
              <TableCell><Typography>Amenities</Typography></TableCell>
              <TableCell><Typography>Add Amenity</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms ? (
              rooms.map((row) => {
                return (
                  <>
                    <TableRow key={row.id}>
                      <TableCell>
                        <Chip
                          key={row}
                          color="primary"
                          variant="outlined"
                          label={row.roomNumber}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {row.status}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {row.type}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          key={row}
                          color="warning"
                          onClick={() => fetchRoomBookings(row.id)}
                          variant="outlined"
                          icon={<FaceIcon />}
                          label={row.bookings + " bookings."}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          key={row}
                          color="info"
                          variant="outlined"
                          icon={<MoneyIcon />}
                          label={"R" + row.revenue + ".00"}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          key={row}
                          color="warning"
                          variant="outlined"
                          icon={<FaceIcon />}
                          label={row.visits + " visits."}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {row.numBookings}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {row.amenities.map((item) => {
                          return (
                            <Chip
                              key={item}
                              color="success"
                              variant="outlined"
                              label={item}
                              icon={<Delete />}
                              onClick={() => handleAmenityDelete(item, row.id)}
                            />
                          );
                        })}{" "}
                      </TableCell>
                      <TableCell>
                        {row.additional.length > 0 ? (
                          <>
                            <Select
                              color="primary"
                              sx={{ width: 300 }}
                              native
                              onChange={setAmenityOnChange}
                              input={
                                <OutlinedInput
                                  label="Amenities"
                                  id="demo-dialog-native"
                                />
                              }>
                              <option value=""></option>
                              {row.additional.map((item) => {
                                return (
                                  <>
                                    <option value={item}>{item}</option>
                                  </>
                                );
                              })}
                            </Select>
                            <Divider />
                            <Divider />
                            <Chip
                              color="success"
                              onClick={() => handleAmenityChange(row.id)}
                              label="Add Amenity"
                              icon={<Save />} />
                          </>
                        ) : (
                          <>No Amenities To Add</>
                        )}
                      </TableCell>
                    </TableRow>
                  </>
                );
              })
            ) : (
              <>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}>
                  <CircularProgress thickness={1} />
                </Box>
              </>
            )}
          </TableBody>
        </Table>
        <Dialog open={isBookings} onClose={() => setIsBookings(false)}>
          <DialogTitle>
            Room Bookings
          </DialogTitle>
          <DialogContent>
            {bookings.length > 0 && (
              bookings.map((booking) => (
                <>
                  <Paper
                    key={booking.id}
                    sx={{
                      p: 2,
                      margin: "auto",
                      maxWidth: "100%",
                      flexGrow: 1,
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark" ? "#1AFF27" : "#fffc",
                    }}>
                    <Grid container spacing={2}>
                      <Grid item>
                        <Chip
                          color="warning"
                          variant="outlined"
                          icon={<FaceIcon />}
                          label={booking.guest}
                        />
                      </Grid>
                      <Grid item xs={12} sm container>
                        <Grid item xs container direction="column" spacing={10}>
                          <Grid item xs>
                            <Chip
                              color="info"
                              variant="outlined"
                              icon={<CalendarMonth />}
                              label={"Check In: " + dayjs(booking.checkin).format("YYYY-MM-DD")}
                            />
                            <Divider />
                            <Divider />
                            <Divider />
                            <Chip
                              color="primary"
                              variant="outlined"
                              icon={<CalendarMonth />}
                              label={"Check Out: " + dayjs(booking.checkout).format("YYYY-MM-DD")}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>
                  <Typography></Typography>
                  <Divider />
                  <Divider />
                  <Divider />
                  <Divider />
                  <Divider />
                  <Divider />
                </>
              ))
            )}

          </DialogContent>
          <DialogActions>
            <Button variant="plain" color="neutral" onClick={() => setIsBookings(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <>
        <MySnack alive={amenityAdded}
          handleClose={handleClose} message="Amenity Added To Room!." />
        <MySnack alive={amenityDeleted}
          handleClose={handleClose} message="Amenity Deleted From Room!." />

        <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
          <DialogTitle>
            <WarningRoundedIcon />
            Delete Amenity.
          </DialogTitle>
          <DialogContent>
            Are you sure you want to remove this amenity?
          </DialogContent>
          <DialogActions>
            <Button variant="solid" color="danger" onClick={() => removeAmenity()}>
              Continue
            </Button>
            <Button variant="plain" color="neutral" onClick={() => setOpenDelete(false)}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </ThemeProvider >
  );
}
