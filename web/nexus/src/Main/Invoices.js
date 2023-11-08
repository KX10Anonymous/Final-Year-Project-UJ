import FaceIcon from "@mui/icons-material/Face";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/joy/Typography";
import { styled } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Auth/UserProvider";
import axios from "axios";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [changed, setChanged] = useState(false);
  const user = useUser();
  const navigate = useNavigate();
  const url = process.env.PUBLIC_URL + "/src/badge.png";

  useEffect(() => {
    if (!user.jwt) {
      navigate("/login");
    }
    const fetchInvoices = async () => {
      if (user.role === "GUEST") {
        await fetch(
          "http://localhost:8080/nexus/api/invoices/all/" + user.jwt,
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
                setInvoices(data);
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
    if (user) {
      fetchInvoices();
    }
  }, [user, navigate, changed]);

  const generatePdf = async (invoiceId) => {
    try {
      await fetch(
        "http://localhost:8080/nexus/api/invoices/regenerate/" + invoiceId,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "GET",
        }
      )
        .then((response) => {
          if (response.status === 200) {
            response.json().then((generatePdfData) => {
              if (generatePdfData) {
                setChanged(!changed);
              }
            });
          }
        })
        .catch((message) => {
          console.log("Error Reading Response");
        });
    } catch (error) {
      console.log("Error Reading Guests");
    }
    setChanged(!changed);
  };

  const downloadInvoice = (invoiceName) => {
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
      })
      .catch((error) => {
        console.log('Error Downloading Invoice');
      });
  }


  const Img = styled("img")({
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
  });

  return (
    <>
      {user && user.jwt && invoices ? (
        <div>
          {invoices.map((invoice) => (
            <>
              <Paper
                key={invoice.id}
                sx={{
                  p: 2,
                  margin: "auto",
                  maxWidth: "60%",
                  flexGrow: 1,
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark" ? "#1A2027" : "#fff",
                }}>
                <Grid container spacing={2}>
                  <Grid item>
                    <ButtonBase sx={{ width: 228, height: 228 }}>
                      <Img alt="complex" src={url} />
                    </ButtonBase>
                  </Grid>

                  <Grid item xs={12} sm container>
                    <Grid item xs container direction="column" spacing={2}>
                      <Grid item xs>
                        <Typography
                          gutterBottom
                          variant="h3"
                          color="info"
                          component="div">
                          Total: R{invoice.total}.00
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <Chip
                            icon={<FaceIcon />}
                            label={invoice.guest}
                            variant="outlined"
                            color="info"
                          />
                        </Typography>
                        {invoice.items.map((item) => (
                          <ListItem key={item.name}>
                            <ListItemText
                              primary={item.name}
                              secondary={item.name}
                            />
                            <Typography variant="body2">
                              R{item.rate} . 00  *  {invoice.days}
                            </Typography>
                          </ListItem>
                        ))}
                      </Grid>
                      <Grid item>
                        <Stack direction="row" spacing={1}>
                          {invoice.fileName ? (
                            <>
                              <Chip
                                color="success"
                                label="Download Invoice"
                                onClick={() => downloadInvoice(invoice.fileName)}
                              />
                              <Chip
                                color="primary"
                                label="Regenerate Invoice"
                                onClick={() => generatePdf(invoice.id)}
                              />
                            </>
                          ) : (<Chip
                            color="primary"
                            label="Generate Invoice"
                            onClick={() => generatePdf(invoice.id)}
                          />)}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2" gutterBottom>
                      <Chip
                        color="primary"
                        label={"Created: " + invoice.created}
                        variant="outlined"
                      />
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <Chip
                        color="primary"
                        label={"Invoice Number: #" + invoice.invoiceNumber}
                        variant="outlined"
                      />
                    </Typography>
                  </Grid>

                </Grid>
              </Paper>
              <Divider /><Divider />
              <Divider /><Divider />
              <Divider /><Divider />
            </>
          ))}
        </div>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary">
            No Invoices
          </Typography>
        </>
      )}
    </>
  );
};

export default Invoices;
