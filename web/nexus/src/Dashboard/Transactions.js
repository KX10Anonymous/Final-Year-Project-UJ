import Icon from "@mui/material/Icon";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/joy/Typography";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Auth/UserProvider";


export default function Transactions(isTransactions) {
  const user = useUser();
  const navigate = useNavigate();
  const [transactions, setTransactions] = React.useState(undefined);
  React.useEffect(() => {
    const fetchReport = async () => {
      if (user.role === "MANAGER" || user.role === "OWNER") {
        await fetch(
          "http://localhost:8080/nexus/api/data/transactions/" + user.jwt,
          {
            headers: {
              "Content-Type": "application/json",
            },
            method: "GET",
          }
        )
          .then((response) =>
            response.json().then((data) => {
              setTransactions(data);
            })
          )
          .catch((message) => {
            console.log("Error Reading Reports");
          });
      } else {
        navigate("/login");
      }
    };
    if (isTransactions) {
      fetchReport();
    }
  }, [user, isTransactions, navigate]);

  return transactions ? (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell scope="col"></TableCell>
          <TableCell scope="col"><Typography>Total Bookings</Typography></TableCell>
          <TableCell scope="col"><Typography>Expected Payments</Typography></TableCell>
          <TableCell scope="col"><Typography>Total Checkins</Typography></TableCell>
          <TableCell scope="col"><Typography>Revenue</Typography></TableCell>
          <TableCell scope="col"><Typography>Visits</Typography></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell scope="col"><Typography>Value</Typography></TableCell>
          <TableCell><Typography>{transactions.totalBookings}</Typography></TableCell>
          <TableCell><Typography>R {parseFloat(transactions.expectedPayments).toFixed(2)}</Typography></TableCell>
          <TableCell><Typography>{transactions.checkedInBookings}</Typography></TableCell>
          <TableCell><Typography>R {parseFloat(transactions.revenue).toFixed(2)}</Typography></TableCell>
          <TableCell><Typography>{transactions.visits}</Typography></TableCell>
        </TableRow>
        <TableRow>
          <TableCell scope="col">Averages(Monthly Growth)</TableCell>
          {transactions.bookingsGrowth < 0 ? (
            <>
              <TableCell className="text-danger">
                <Icon className="me-1" fas icon="caret-down" />+
                -{parseFloat(transactions.bookingsGrowth).toFixed(2)}%
              </TableCell>
            </>
          ) : (
            <>
              <TableCell className="text-success">
                <Icon className="me-1" fas icon="caret-down" />
                + {parseFloat(transactions.bookingsGrowth).toFixed(2)}%
              </TableCell>
            </>
          )}

          <TableCell className="text-success">
            <Icon className="me-1" fas icon="caret-up" />
            + {parseFloat(transactions.monthlyGrowth).toFixed(2)}%
          </TableCell>
          <TableCell className="text-success">
            <Icon className="me-1" fas icon="caret-up" />
            {parseFloat(transactions.checkinAverage).toFixed(2)}%
          </TableCell>
          <td className="text-success">
            <Icon className="me-1" fas icon="caret-up" />
            + R {parseFloat(transactions.averagePayment).toFixed(2)}
          </td>
          <td className="text-success">
            <Icon className="me-1" fas icon="caret-down" />
            +{transactions.monthlyBookings}
          </td>
        </TableRow>
      </TableBody>
    </Table>
  ) : (
    <>Nothing To Show</>
  );
}
