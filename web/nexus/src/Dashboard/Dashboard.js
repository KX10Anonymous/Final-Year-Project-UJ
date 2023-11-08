import { Task } from "@mui/icons-material";
import BarChart from "@mui/icons-material/BarChart";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MoneyIcon from "@mui/icons-material/Money";
import Person from "@mui/icons-material/Person";
import Room from "@mui/icons-material/Room";
import RoomService from "@mui/icons-material/RoomService";
import Typography from "@mui/joy/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import MuiDrawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid";
import {
  default as Button,
  default as IconButton,
} from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import { styled } from "@mui/material/styles";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import RegisterStaff from "../Auth/RegisterStaff";
import { useUser } from "../Auth/UserProvider";
import Amenities from "./Amenities";
import Guests from "./Guests";
import InvoicesReport from "./InvoicesReport";
import Popularity from "./Popularity";
import Rooms from "./Rooms";
import Seasonality from "./Seasonality";
import Staff from "./Staff";
import Transactions from "./Transactions";
import Financial from "./Financial";
const drawerWidth = 240;

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

export default function Dashboard() {
  const user = useUser();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(true);
  const [isReports, setIsReports] = React.useState(true);
  const [isStaff, setIsStaff] = React.useState(false);
  const [isAmenities, setIsAmenities] = React.useState(false);
  const [isActivity, setIsActivity] = React.useState(false);
  const [isInvoices, setIsInvoices] = React.useState(false);
  const [isGuests, setIsGuests] = React.useState(false);
  const [isRooms, setIsRooms] = React.useState(false);
  const [isChanged, setIsChanged] = React.useState(false);
  const [popularitySummary, setPopularitySummary] = React.useState(undefined);
  const [seasonSummary, setSeasonSummary] = React.useState(undefined);
  const [registrationConversion, setRegistrationConversion] = React.useState(undefined);
  const [bookingConversion, setBookingConversion] = React.useState(undefined);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  React.useEffect(() => {
    if (user.role === "MANAGER" || user.role === "OWNER") {
      console.log("WELCOME TO THE DASHBOARD");
    } else {
      navigate("/login");
    }
  });

  React.useEffect(() => {
    const fetchReport = async () => {
      if (user.role === "MANAGER" || user.role === "OWNER") {
        await fetch(
          "http://localhost:8080/nexus/api/data/seasonalitySummary/" + user.jwt,
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
                setSeasonSummary(data);
              });
            } else {
              console.log("Unauthorized Action.");
            }
          })
          .catch((message) => {
            console.log("Error Reading Reports: " + message);
          });
      }
    };
    if (isReports) {
      fetchReport();
    }
  }, [user, isReports]);

  React.useEffect(() => {
    const fetchReport = async () => {
      if (user.role === "MANAGER" || user.role === "OWNER") {
        await fetch(
          "http://localhost:8080/nexus/api/data/popularitySummary/" + user.jwt,
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
                setPopularitySummary(data);
              });
            } else {
              console.log("Unauthorized Action.");
            }
          })
          .catch((message) => {
            console.log("Error Reading Reports: " + message);
          });
      }
    };
    if (isReports) {
      fetchReport();
    }
  }, [user, isReports]);

  React.useEffect(() => {
    const fetchReport = async () => {
      if (user.role === "MANAGER" || user.role === "OWNER") {
        await fetch(
          "http://localhost:8080/nexus/api/data/bookingConversion/" + user.jwt,
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
                setBookingConversion(data);
              });
            } else {
              console.log("Unauthorized Action.");
            }
          })
          .catch((message) => {
            console.log("Error Reading Reports");
          });
      }
    };
    if (isReports) {
      fetchReport();
    }
  }, [user, isReports]);

  React.useEffect(() => {
    const fetchReport = async () => {
      if (user.role === "MANAGER" || user.role === "OWNER") {
        await fetch(
          "http://localhost:8080/nexus/api/data/registrationConversion/" + user.jwt,
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
                setRegistrationConversion(data);
              });
            } else {
              console.log("Unauthorized Action.");
            }
          })
          .catch((message) => {
            console.log("Error Reading Reports");
          });
      }
    };
    if (isReports) {
      fetchReport();
    }
  }, [user, isReports]);

  const updateIsChanged = (change) => {
    setIsChanged(change);
  };

  const handleReportsClick = () => {
    resetButtons();
    setIsReports(true);
  };

  const handleAmenitiesClick = () => {
    resetButtons();
    setIsAmenities(true);
  };

  const handleStaffClick = () => {
    resetButtons();
    setIsStaff(true);
  };

  const resetButtons = () => {
    setIsReports(false);
    setIsRooms(false);
    setIsGuests(false);
    setIsStaff(false);
    setIsActivity(false);
    setIsInvoices(false);
    setIsAmenities(false);
  };

  const handleActivityClick = () => {
    resetButtons();
    setIsActivity(true);
  };

  const handleInvoicesClick = () => {
    resetButtons();
    setIsInvoices(true);
  };

  const handleGuestsClick = () => {
    resetButtons();
    setIsGuests(true);
  };

  const handleRoomsClick = () => {
    resetButtons();
    setIsRooms(true);
  };
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: [1],
          }}>
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>

        <Divider />
        <Button onClick={() => handleReportsClick()}>
          <Chip label="Reports" variant="outlined" icon={<BarChart />} />
        </Button>
        <Button onClick={() => handleAmenitiesClick()}>
          <Chip label="Amenities" variant="outlined" icon={<RoomService />} />
        </Button>
        <Button onClick={handleStaffClick}>
          <Chip label="Staff" variant="outlined" icon={<Person />} />
        </Button>
        <Button onClick={() => handleActivityClick()}>
          <Chip label="Operations Summary" variant="outlined" icon={<Task />} />
        </Button>
        <Button onClick={() => handleRoomsClick()}>
          <Chip label="Rooms" variant="outlined" icon={<Room />} />
        </Button>
        <Button onClick={() => handleInvoicesClick()}>
          <Chip label="Invoices" variant="outlined" icon={<MoneyIcon />} />
        </Button>
        <Button onClick={() => handleGuestsClick()}>
          <Chip label="Guests" variant="outlined" icon={<Person />} />
        </Button>
      </Drawer>
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
        }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 0, mb: 0, marginLeft: 1 }}>
          <Grid container spacing={5}>
            {isReports && popularitySummary && seasonSummary ? (
              <>
                <Container maxWidth="lg" sx={{ mt: 0, mb: 0, marginLeft: 1 }}>
                  <Grid container spacing={30}>
                    <Grid item md={6.6} >
                      <Paper
                        sx={{
                          p: 0,
                          display: "flex",
                          flexDirection: "column",
                          height: 600,
                          width: 731,
                        }}>
                        <Typography
                          color="success"
                          level="h3"
                          noWrap={false}
                          variant="soft"
                          align="center">
                          Seasonality
                        </Typography>
                        <Seasonality isReports={isReports} />
                      </Paper>
                    </Grid>
                    <Grid item xs={5} md={2} lg={1}>
                      <Paper
                        sx={{
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          height: 600,
                          width: 731,
                        }}>
                        <Typography
                          color="success"
                          level="h3"
                          noWrap={false}
                          variant="soft"
                          align="center">
                          Room Popularity
                        </Typography>
                        <Popularity isReports={isReports} />
                      </Paper>
                    </Grid>
                  </Grid>
                </Container>
                <Container maxWidth="lg" sx={{ mt: 5, mb: 0, marginLeft: 1 }}>
                  <Grid container spacing={30}>
                    <Grid item md={6.6}>
                      <Paper
                        sx={{
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          width: 731,
                        }}>
                        <Typography
                          color="black"
                          level="h1"
                          noWrap={false}
                          variant="soft">
                          Seasonality Summary
                        </Typography>
                        <Typography
                          color="black"
                          level="h3"
                          noWrap={false}
                          variant="soft">
                          {seasonSummary.title} is the most visited month.
                        </Typography>
                        <Typography
                          color="black"
                          level="h1"
                          noWrap={false}
                          variant="soft">
                          {seasonSummary.visits} Visits.
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={5} md={2} lg={1}>
                      <Paper
                        sx={{
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          width: 731,
                        }}>
                        <Typography
                          color="black"
                          level="h1"
                          noWrap={false}
                          variant="soft">
                          Popularity Summary
                        </Typography>
                        <Typography
                          color="black"
                          level="h3"
                          noWrap={false}
                          variant="soft">
                          {popularitySummary.title} is the most visited room type.
                        </Typography>
                        <Typography
                          color="warning"
                          level="h1"
                          noWrap={false}
                          variant="soft">
                          {popularitySummary.visits} Visits.

                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Container>

                {bookingConversion && registrationConversion && (
                  <>
                    <Container maxWidth="lg" sx={{ mt: 2, mb: 9, marginLeft: 1 }}>
                      <Grid container spacing={30}>
                        <Grid item md={6.6}>
                          <Paper
                            sx={{
                              p: 2,
                              display: "flex",
                              flexDirection: "column",
                              width: 731,
                            }}>

                            <Typography
                              color="black"
                              level="h1"
                              noWrap={false}
                              variant="soft">
                              Booking Conversion
                            </Typography>
                            <Typography
                              color="success"
                              level="h5"
                              noWrap={false}
                              variant="soft">
                              [This are the percentage of booking that check in]
                            </Typography>
                            <Typography
                              color="black"
                              level="h3"
                              noWrap={false}
                              variant="soft">
                              {parseFloat(bookingConversion).toFixed(2)} %.%
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={5} md={2} lg={1}>
                          <Paper
                            sx={{
                              p: 2,
                              display: "flex",
                              flexDirection: "column",
                              width: 731,
                            }}>
                            <Typography
                              color="black"
                              level="h1"
                              noWrap={false}
                              variant="soft">
                              Registration Conversion
                            </Typography>
                            <Typography
                              color="success"
                              level="h5"
                              noWrap={false}
                              variant="soft">
                              [This are the percentage of users who make bookings]
                            </Typography>
                            <Typography
                              color="black"
                              level="h3"
                              noWrap={false}
                              variant="soft">
                              {parseFloat(registrationConversion).toFixed(2)} %.
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Container>
                  </>)}
              </>
            ) : (
              <></>
            )}

            {isStaff ? (
              <>
                <Grid item xs={12} md={7} lg={8}>
                  <Paper
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      width: 710,
                    }}>
                    <Typography
                      color="success"
                      level="h3"
                      noWrap={false}
                      variant="soft"
                      align="center">
                      Staff{" "}
                    </Typography>
                    <Staff isStaff={isStaff} isChanged={isChanged} />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4} lg={3}>
                  <Paper
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      width: 630,
                    }}>
                    <Typography
                      color="success"
                      level="h3"
                      noWrap={false}
                      variant="soft"
                      align="center">
                      +Add New Employee
                    </Typography>
                    <RegisterStaff
                      updateIsChanged={updateIsChanged}
                      isChanged={isChanged}
                    />
                  </Paper>
                </Grid>
              </>
            ) : (
              <></>
            )}
          </Grid>

          {isAmenities ? (
            <>
              <Amenities isAmenities={isAmenities} />
            </>
          ) : (
            <></>
          )}
          {isInvoices ? (
            <>
              <Container maxWidth="lg" sx={{ mt: 5, mb: 0, marginLeft: 1 }}>
                <Grid container>
                  <Grid item xs={12} md={7} lg={8}>
                    <Paper
                      sx={{
                        p: 0,
                        ml: 0,
                        display: "flex",
                        flexDirection: "column",
                        width: 1400,
                        flexWrap: "flex",
                      }}>
                      <Typography
                        color="success"
                        level="h3"
                        noWrap={false}
                        variant="soft"
                        align="center">
                        Invoices Report
                      </Typography>
                      <InvoicesReport isReports={isReports} />
                    </Paper>
                  </Grid>
                </Grid>
              </Container>
            </>
          ) : (
            <></>
          )}

          {isRooms ? (
            <>
              <Grid item md={12}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: "auto",
                    flexWrap: "auto",
                    width: 1400,
                  }}>
                  <Typography
                    color="success"
                    level="h3"
                    noWrap={false}
                    variant="soft"
                    align="center">
                    Rooms Summary
                  </Typography>
                  <Rooms isRooms={isRooms} />
                </Paper>
              </Grid>
            </>
          ) : (
            <></>
          )}

          {isGuests ? (
            <>
              <Container maxWidth="lg" sx={{ mt: 5, mb: 0, marginLeft: 1 }}>
                <Grid container>
                  <Grid item xs={12} md={7} lg={8}>
                    <Paper
                      sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: "auto",
                        flexWrap: "flex",
                        width:1400
                      }}>
                      <Typography
                        color="success"
                        level="h3"
                        noWrap={false}
                        variant="soft"
                        align="center">
                        All Guests
                      </Typography>
                      <Guests isGuests={isGuests} />
                    </Paper>
                  </Grid>
                </Grid>
              </Container>
            </>
          ) : (
            <></>
          )}

          {isActivity ? (
            <>
              <Container maxWidth="lg" sx={{ mt: 5, mb: 0, marginLeft: 1 }}>
                <Grid container>
                  <Grid item xs={12} md={7} lg={8}>
                    <Paper
                      sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        width: 1400,
                      }}>
                      <Typography
                        color="warning"
                        level="h3"
                        noWrap={false}
                        variant="outlined"
                        align="center">
                        Operations Summary.
                      </Typography>
                      <Transactions isTransactions={isActivity} />
                    </Paper>
                  </Grid>
                  <Grid sx={{ mt: 5, mb: 5 }}>
                    <Paper
                      sx={{
                        p: 0,
                        ml: 0,
                        display: "flex",
                        flexDirection: "column",
                        width: 1400,
                        minHeight: 600,
                        flexWrap: "flex",
                      }}>
                      <Typography
                        color="success"
                        level="h3"
                        noWrap={false}
                        variant="soft"
                        align="center">
                        Annual Performance.
                      </Typography>
                      <Financial isTransactions={isActivity} />
                    </Paper>
                  </Grid>
                </Grid>
              </Container>
            </>
          ) : (
            <></>
          )}
        </Container>
      </Box>
    </Box>
  );
}
