import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/joy/Typography";
import * as React from "react";
import { useUser } from "../Auth/UserProvider";

const payments = [
    { name: 'Card type', detail: 'Visa' },
    { name: 'Card holder', detail: ''},
    { name: 'Card number', detail: 'xxxx-xxxx-xxxx-1234' },
    { name: 'Expiry date', detail: '04/2024' },
  ];

export default function Review({id}) {
    const user = useUser();
  const [invoice, setInvoice] = React.useState();

  React.useEffect(() => {
    const fetchInvoice = async () => {
      if (user.role === "CLERK" || user.role === "MANAGER") {
        const reqBody ={
            id : id,
        }
        await fetch(
          "http://localhost:8080/nexus/api/invoices/create/" + user.jwt,
          {
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(reqBody),
            method: "put",
          }
        )
          .then((response) => {
            if (response.status === 200) {
              response.json().then((data) => {
                setInvoice(data);
              });
            } else {
              console.log("No Invoice Found");
            }
          })
          .catch((message) => {
            console.log("Error Reading Invoice: " + message);
          });
      }
    };
    if(id){
      if(user){
        fetchInvoice();
      }
    }
  }, [user, id]);

  if(!invoice){
    return null;
  };

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        INVOICE NO. #{invoice.invoiceNumber}
      </Typography>
      <List disablePadding>
        {invoice.items.map((item) => (
          <ListItem key={item.name} sx={{ py: 1, px: 0 }}>
            <ListItemText primary={item.name} secondary={item.name} />
            <Typography variant="body2">R{item.rate},00</Typography>
          </ListItem>
        ))}
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Total" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            R{invoice.total}.00
          </Typography>
        </ListItem>
      </List>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Guest
          </Typography>
          <Typography gutterBottom>{invoice.guest}</Typography>
        </Grid>
        <Grid item container direction="column" xs={12} sm={6}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Payment details
          </Typography>
          <Grid container>
           
             {payments.map((payment) => (
              <React.Fragment key={payment.name}>
                <Grid item xs={6}>
                  <Typography gutterBottom>{payment.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography gutterBottom>{payment.detail}</Typography>
                </Grid>
              </React.Fragment>
            ))}
         
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
