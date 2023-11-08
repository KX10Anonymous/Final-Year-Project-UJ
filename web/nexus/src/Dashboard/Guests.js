import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Mail from "@mui/icons-material/MailOutline";
import Phone from "@mui/icons-material/Phone";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/joy/Typography";
import CircularProgress from "@mui/joy/CircularProgress";
import Divider from "@mui/material/Divider";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Auth/UserProvider";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

export default function Guests(isGuests) {
  const navigate = useNavigate();
  const user = useUser();
  const [guests, setGuests] = React.useState([]);
  const [isChanged, setIsChanged] = React.useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = React.useState(false);
  const [userId, setUserId] = React.useState();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        await fetch("http://localhost:8080/nexus/api/data/guests/" + user.jwt, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "GET",
        })
          .then((response) => {
            if (response.status === 200) {
              response.json().then((data) => {
                setGuests(data);
              });
            } else if (response.status === 204) {
              alert("Couldn't Retrieve Guests Records");
            }
          })
          .catch((message) => {
            console.log("Error Reading Response: " + message);
          });
      } catch (error) {
        console.log("Error Reading Guets: " + error);
      }
    };
    if (user.role === "OWNER" || user.role === "MANAGER") {
      if (isGuests) {
        fetchData();
      }
    } else {
      navigate("/login");
    }
  }, [isGuests, navigate, user, isChanged]);

  const handleDeactivateClick = (id) => {
    setUserId(id);
    setConfirmDeactivate(true);
  }

  const activate = (id) => {
    setIsChanged(false);
    const reqBody = {
      id: id,
    };
    try {
      fetch("http://localhost:8080/nexus/api/users/activate/" + user.jwt, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify(reqBody),
      })
        .then((response) => {
          if (response.status === 200) {
            response.json().then((data) => {
              if (data === true) {
                setIsChanged(true);
              }
            });
          } else if (response.status === 204) {
            alert("Couldn't Retrieve Guests Records");
          }
        })
        .catch((message) => {
          console.log("Error Reading Response: " + message);
        });
    } catch (error) {
      console.log("Error Reading Guets: " + error);
    }
  };

  const deactivate = () => {
    setIsChanged(false);
    const reqBody = {
      id: userId,
    };
    try {
      fetch("http://localhost:8080/nexus/api/users/deactivate/" + user.jwt, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify(reqBody),
      })
        .then((response) => {
          if (response.status === 200) {
            response.json().then((data) => {
              if (data === true) {
                setIsChanged(true);
              }
            });
          } else if (response.status === 204) {
            alert("Couldn't Retrieve Guests Records");
          }
        })
        .catch((message) => {
          console.log("Error Reading Response");
        });
    } catch (error) {
      console.log("Error Reading Guets");
    }
    setConfirmDeactivate(false);
  };

  return isGuests && guests.length > 0 && (
    <>

      <div>
        <React.Fragment>
          <Table size="large">
            <TableHead>
              <TableRow>
                <TableCell><Typography>Name</Typography></TableCell>
                <TableCell>
                  <Typography>Visits By Guest.</Typography>
                </TableCell>
                <TableCell><Typography>Phone</Typography></TableCell>
                <TableCell>
                  <Typography>Email</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {guests ? (
                guests.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Typography color="warning">
                        {row.guest}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography color="danger">
                        {row.visits + " visits."}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.phone}
                        color="success"
                        variant="outlined"
                        icon={<Phone />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.email}
                        color="success"
                        variant="outlined"
                        icon={<Mail />}
                      />
                    </TableCell>
                    <TableCell>
                      {row.status === "LOCKED" ? (
                        <Button variant="outlined" color="success" onClick={() => activate(row.id)}>
                          Activate
                        </Button>
                      ) : (
                        <Button variant="outlined" color="danger" onClick={() => handleDeactivateClick(row.id)}>
                          Deactivate
                        </Button>
                      )}
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
      <>
        <Modal open={confirmDeactivate} onClose={() => setConfirmDeactivate(false)}>
          <ModalDialog variant="outlined" role="alertdialog">
            <DialogTitle>
              <WarningRoundedIcon />
              Deactivate User.
            </DialogTitle>
            <Divider />
            <DialogContent>
              Are you sure you want to deactivate this guest.?
            </DialogContent>
            <DialogActions>
              <Button variant="solid" color="danger" onClick={() => deactivate()}>
                Continue
              </Button>
              <Button variant="plain" color="neutral" onClick={() => setConfirmDeactivate(false)}>
                Cancel Action
              </Button>
            </DialogActions>
          </ModalDialog>
        </Modal>
      </>
    </>
  )
}
