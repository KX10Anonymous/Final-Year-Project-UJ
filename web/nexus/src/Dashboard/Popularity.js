import Box from "@mui/joy/Box";
import CircularProgress from "@mui/joy/CircularProgress";
import { BarChart } from "@mui/x-charts/BarChart";
import * as React from "react";
import { useUser } from "../Auth/UserProvider";

export default function Popularity(isReports) {
  const [rooms, setRooms] = React.useState([]);
  const [stats, setStats] = React.useState([]);

  const user = useUser();

  React.useEffect(() => {
    const fetchReport = async () => {
      if (user.role === "MANAGER" || user.role === "OWNER") {
        await fetch(
          "http://localhost:8080/nexus/api/data/popularity/" + user.jwt,
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
                setRooms(data.type);
                setStats(data.visits);
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

  const renderData = () => {
    if (rooms.length > 0 && stats.length > 0) {
      return (
        <React.Fragment>
          {rooms.length > 0 && stats.length > 0 ? (
            <>
              <BarChart
                label="Months"

                xAxis={[
                  {
                    id: "barCategories",
                    data: rooms,
                    scaleType: "band",
                    label: "Months",
                    color: "#22FDAA",
                  },
                ]}
                series={[
                  {
                    data: stats,
                    label: "Number of Visits",
                    color: "#CCAA3D"
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
