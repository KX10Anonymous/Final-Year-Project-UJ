import Box from "@mui/joy/Box";
import CircularProgress from "@mui/joy/CircularProgress";
import { BarChart } from "@mui/x-charts/BarChart";
import * as React from "react";
import { useUser } from "../Auth/UserProvider";

export default function Seasonality(isReports) {
  const user = useUser();
  const [months, setMonths] = React.useState([]);
  const [stats, setStats] = React.useState([]);
  React.useEffect(() => {
    const fetchReport = async () => {
      if (user.role === "MANAGER" || user.role === "OWNER") {
        await fetch(
          "http://localhost:8080/nexus/api/data/seasonality/" + user.jwt,
          {
            headers: {
              "Content-Type": "application/json",
            },
            method: "GET",
          }
        )
          .then((response) =>
            response.json().then((data) => {
              setStats(data.stats);
              setMonths(data.months);
            })
          )
          .catch((message) => {
            console.log("Error Reading Reports");
          });
      }
    };
    if(isReports){
      fetchReport();
    }
    
  }, [user, isReports]);

  return (
    <React.Fragment>
      {months.length > 0 && stats.length > 0 ? (
        <>
          <BarChart
            label="Months"
            
            xAxis={[
              {
                id: "barCategories",
                data: months,
                scaleType: "band",
                label: "Months",
                color: "#22FDAA",
                tickFontSize:2,
                labelFontSize:10,
              },
            ]}
            series={[
              {
                data: stats,
                label: "Number of Visits",
                color: "#AA13D2"
              },
            ]}
            width={730}
            height={500}
          />
        </>
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
    </React.Fragment>
  );
}
