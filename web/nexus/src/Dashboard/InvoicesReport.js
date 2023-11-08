import CalendarMonth from "@mui/icons-material/CalendarMonth";
import MoneyIcon from "@mui/icons-material/Money";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import CircularProgress from "@mui/joy/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import Chip from "@mui/material/Chip";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import dayjs from "dayjs";
import * as React from "react";
import { useUser } from "../Auth/UserProvider";
import axios from "axios";
import Typography from "@mui/joy/Typography";

export default function InvoicesReport(isReports) {
  const [invoices, setInvoices] = React.useState([]);
  const [changed, setChanged] = React.useState(false);

  const user = useUser();

  React.useEffect(() => {
    const fetchReport = async () => {
      if (user.role === "MANAGER" || user.role === "OWNER") {
        await fetch(
          "http://localhost:8080/nexus/api/data/invoices/" + user.jwt,
          {
            headers: {
              "Content-Type": "application/json",
            },
            method: "get",
          }
        )
          .then((response) => {
            if (response.status === 200) {
              response.json().then((data) => {
                setInvoices(data);
              });
            }
          })
          .catch((message) => {
            console.error("Error Reading Reports: " + message);
          });
      }
    };
    if (isReports) {
      fetchReport();
    }
  }, [user, isReports, changed]);


  const downloadSpreadSheet = () => {
    axios({
      url: "http://localhost:8080/nexus/api/data/download-spreadsheet",
      method: 'GET',
      responseType: 'blob',
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'Invoices.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.log('Error Downloading Invoices SpreadSheet');
      });

  };

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

  return (
    <div>
      <React.Fragment>
      <Chip
            onClick={() => downloadSpreadSheet()}
            color="primary"
            variant="outlined"
            label="Generate SpreadSheet" />
        <Table size="large">
          <TableHead>
            <TableRow>
              <TableCell><Typography>Name</Typography></TableCell>
              <TableCell>
                <Typography><CalendarMonth />Check Out</Typography>
              </TableCell>
              <TableCell><Typography>Room Type</Typography></TableCell>
              <TableCell align="right">
                <Typography><MoneyIcon />Total From Booking</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices ? (
              invoices.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Typography color="warning">
                      {row.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="info">
                      {dayjs(row.checkout).format("dddd, MMMM D")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="warning">
                      {row.type}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography color="success"
                    >R. {row.amount}.00
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {
                      row.fileName ?
                        (
                          <>
                            <Button variant="outlined" color="neutral" onClick={() => downloadInvoice(row.fileName)}>
                              Download
                            </Button>
                          </>) : (
                          <>
                            <Button variant="outlined" color="neutral" onClick={() => generatePdf(row.id)}>
                              Generate Printable
                            </Button>
                          </>)
                    }

                  </TableCell>

                </TableRow>
              ))
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
      </React.Fragment>
    </div>
  );
}
