import Box from "@mui/joy/Box";
import CircularProgress from "@mui/joy/CircularProgress";
import Chip from "@mui/material/Chip";
import { LineChart } from "@mui/x-charts/LineChart";
import * as React from "react";
import { useUser } from "../Auth/UserProvider";

export default function Financial(isTransactions) {
  const [months, setMonths] = React.useState([]);
  const [stats, setStats] = React.useState([]);
  const [year, setYear] = React.useState(2023);
  const [color, setColor] = React.useState("#54B4D3");

  const user = useUser();

  const handleYearClick = (y) => {
    if (y !== year) {
      setYear(y);
      setMonths([]);
      setStats([]);
    }

    if(y === 2023){
      setColor("#54B4D3");
    }else{
      setColor("#FFAA22")
    }
  }

  React.useEffect(() => {
    const fetchReport = async () => {
      if (user.role === "MANAGER" || user.role === "OWNER") {
        await fetch(
          "http://localhost:8080/nexus/api/data/annual/" + year,
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
                setMonths(data.months);
                setStats(data.stats);
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
    if (isTransactions) {
      fetchReport();
    }
  }, [user, isTransactions, year]);

  const renderData = () => {
    if (months.length > 0 && stats.length > 0) {
      return (
        <React.Fragment>
          <Chip
            onClick={() => handleYearClick(2022)}
            color="warning"
            variant="outlined"
            label="2022" />
          <Chip
            onClick={() => handleYearClick(2023)}
            color="primary"
            variant="outlined"
            label="2023" />
          <LineChart
            height={500}
            width={1400}
            series={[{ data: stats, label: "Monthly Income "+ year, area: true, color: color }]}
            xAxis={[{
              scaleType: "point", data: months, labelProps: {
                sx: {
                  fontSize: '50px',

                },
              },
            }]}
            sx={{
              ".MuiLineElement-root, .MuiMarkElement-root": {
                display: "none",
              },
            }}
          />
        </React.Fragment>
      );
    } else {
      return (
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
      );
    }
  };

  return <>{renderData()}</>;
}
