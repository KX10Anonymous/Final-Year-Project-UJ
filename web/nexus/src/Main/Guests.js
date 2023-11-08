import CalendarMonth from "@mui/icons-material/CalendarMonth";
import Avatar from "@mui/joy/Avatar";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardActions from "@mui/joy/CardActions";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import dayjs from "dayjs";
import * as React from "react";
import '../App.css';
import { useUser } from "../Auth/UserProvider";
import Review from "../Checkout/Review";
import Timer from "./Countdown/Timer";
import axios from "axios";



export default function Guests({ isGuests, isLoggedIn }) {
  const [guests, setGuests] = React.useState([]);
  const [bookingId, setBookingId] = React.useState("");
  const [openCheckout, setOpenCheckout] = React.useState(false);
  const user = useUser();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        await fetch(
          "http://localhost:8080/nexus/api/users/guests/" + user.jwt,
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
                setGuests(data);
              });
            } else if (response.status === 204) {
              alert("Couldn't Retrieve Records");
            }
          })
          .catch((message) => {
            console.log("Error Reading Response");
          });
      } catch (error) {
        console.log("Error Reading Guests");
      }
    };

    if (isLoggedIn) {
      if (
        user.role === "CLERK" ||
        user.role === "MANAGER" ||
        user.role === "OWNER"
      ) {
        fetchData();
      } else {
        console.log("Not Authorized to view this page");
      }
    }
  }, [user, isLoggedIn, isGuests]);

  const handleCloseDialog = () => {
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
              setGuests((prevGuests) =>
                prevGuests.filter((guest) => guest.bookingId !== data.id)
              );
              setBookingId(data.id);
              setOpenCheckout(true);
            });
          } else if (response.status === 401) {
            alert("Attempted Action Not Authorized For User.");
          }
        })
        .catch((message) => {
         console.log("Error Occured When Checking Out");
        });
    } else {
      alert("Not Authorized To Make This Action.");
    }
  };


  const generatePdf = async () => {
    try {
       await fetch("http://localhost:8080/nexus/api/invoices/pdf/" + bookingId,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "GET",
        }
      ).then((response) => {
        if (response.status === 200) {
          response.json().then((data) => {
            downloadInvoice(data.file);
          });
        } 
      });
    } catch (error) {
      console.log("Error Creating PDF");
    }
  };

  const downloadInvoice =(invoiceName) =>{
    axios({
      url: "http://localhost:8080/nexus/api/invoices/download/" + invoiceName,
      method: 'GET',
      responseType: 'blob',
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = invoiceName; 
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setOpenCheckout(false);
      })
      .catch((error) => {
        console.log('Error Downloading Invoice ');
      });
  }

  const renderCheckout = () => {
    if (user.role === "CLERK" || user.role === "MANAGER") {
      return (
        <Dialog
          open={openCheckout}
          onClose={handleCloseDialog}
          sx={{width: "75%", mx: "auto" }}>
          <DialogTitle>Invoice</DialogTitle>
          <DialogContent>
            <Review id={bookingId} />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeInvoice}>Close</Button>
            <Button onClick={generatePdf}>Generate Printable</Button>
          </DialogActions>
        </Dialog>
      );
    } else {
      return null;
    }
  };
  const closeInvoice = () => {
    setOpenCheckout(false);
  };

  return guests ? (
    <Box
      style={{
        display: "flex",
        justifyContent: "center",
      }}>
      <ImageList gap={40} sx={{ width: 1, height: 1 }}>
        {guests.map((item) => {
          return (
            <>
              <ImageListItem key={item.id}>
                <Card
                  variant="outlined"
                  sx={{ minWidth: "90%", mx: "auto", height: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                    <Avatar src="/static/images/avatar/1.jpg" size="lg" />
                  </Box>

                  <CardContent>
                    <Typography level="title-lg">{item.guest}</Typography>
                    <Typography level="body-sm">
                      {item.type} - {item.roomNumber}
                    </Typography>
                  </CardContent>
                  <CardActions buttonFlex="0 1 120px">
                    <Timer bookingTargetDate={dayjs(item.checkout)} />
                    <Chip
                      label={dayjs(item.checkout).format("YYYY-MM-DD")}
                      color="info"
                      variant="outlined"
                      icon={<CalendarMonth />}
                    />
                    <Button variant="outlined" color="warning" onClick={() => checkOut(item.bookingId)}>
                      Checkout
                    </Button>


                  </CardActions>
                </Card>
              </ImageListItem>
            </>
          );
        })}
      </ImageList>
      {openCheckout && renderCheckout()}
    </Box>
  ) : (
    <>
      <Typography>No Guests Currenty</Typography>
    </>
  );
}
