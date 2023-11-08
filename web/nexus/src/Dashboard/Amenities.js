import AddIcon from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import Box from "@mui/joy/Box";
import CircularProgress from "@mui/joy/CircularProgress";
import IconButton from "@mui/joy/IconButton";
import Sheet from "@mui/joy/Sheet";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Input from "@mui/material/Input";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Auth/UserProvider";
import Typography from "@mui/joy/Typography";
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';


export default function Amenities(isAmenities) {
  const [amenities, setAmenities] = React.useState([]);
  const [rate, setRate] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [id, setId] = React.useState("");
  const [isChanged, setIsChanged] = React.useState(false);
  const user = useUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        await fetch("http://localhost:8080/nexus/api/amenities/all/" + user.jwt, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "GET",
        })
          .then((response) => {
            if (response.status === 200) {
              response.json().then((data) => {
                setAmenities(data);
              });
            } else if (response.status === 204) {
              alert("Couldn't Retrieve Records");
            }
          })
          .catch((message) => {
            console.log("Error Reading Response");
          });
      } catch (error) {
        console.log("Error Reading Amenities");
      }
    };
    if (user.role === "OWNER" || user.role === "MANAGER") {
      if (isAmenities) {
        fetchData();
      }
    } else {
      navigate("/login");
    }
  }, [navigate, user.role, user.jwt, isChanged, isAmenities]);

  const amenityDialog = () => {
    return (
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        sx={{ height: "65%", width: "75%", mx: "auto" }}>
        <DialogTitle>Amenity</DialogTitle>
        <DialogContent>
          {rate && description ? (<>
            <Input placeholder={rate} variant="outlined" color="primary" onChange={(e) => setRate(e.target.value)} />
            <Input placeholder={description} variant="outlined" color="primary" onChange={(e) => setDescription(e.target.value)} />
          </>) : (<>
            <Input placeholder="Rate" variant="outlined" color="primary" onChange={(e) => setRate(e.target.value)} />
            <Input placeholder="Amenity Description" variant="outlined" color="primary" onChange={(e) => setDescription(e.target.value)} />
          </>)}


        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={() => saveAmenity()}>Save Information</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const handleEditClick = (amenity) => {
    setId(amenity.id);
    setDescription(amenity.description);
    setRate(amenity.rate);
    setOpen(true);
    setIsChanged(false);
  };

  const handleDeleteClick = (id) => {
    setId(id);
    setOpenDelete(true);
  }

  const saveAmenity = () => {
    if (user.role === "OWNER" || user.role === "MANAGER") {
      const reqBody = {
        id: id,
        description: description,
        rate: rate,
      };


      if (id) {
        fetch("http://localhost:8080/nexus/api/amenities/edit/" + user.jwt, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "PUT",
          body: JSON.stringify(reqBody),
        }).then((response) => {
          if (response.status === 200) {
            if (isChanged === true) {
              setIsChanged(false);
            } else {
              setIsChanged(true);
            }
            console.log("Changes Made Successfully");
          }
        });
      } else {
        fetch("http://localhost:8080/nexus/api/amenities/create/" + user.jwt, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(reqBody),
        }).then((response) => {
          if (response.status === 200) {
            if (isChanged === true) {
              setIsChanged(false);
            } else {
              setIsChanged(true);
            }
            console.log("Amenity Created");
          }
        });
      }

    }
    setId("");
    setRate("");
    setDescription("");
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const deleteAmenity = async () => {
    setOpenDelete(false);
    if (user.role === "OWNER") {
      const reqBody = {
        id: id,
      };
      await fetch("http://localhost:8080/nexus/api/amenities/delete/" + user.jwt, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "delete",
        body: JSON.stringify(reqBody),
      })
        .then((response) => {
          if (response.status === 200) {
            response.json().then((data) => {
              if (data === false) {
                setAmenities((prevAmenities) =>
                  prevAmenities.filter((amenity) => amenity.id !== id)
                );
              }
            });
          } else if (response.status === 401) {
            alert("Attempted Action Not Authorized");
          }
        })
        .catch((message) => {
          console.log("Error Occurred When Deleting Amenity: " + message);
        });
    } else {
      alert("Not Authorized To Make This Action.");
    }
  };


  return user.role === "OWNER" || user.role === "MANAGER" ? (
    amenities ? (
      <>
        <Box sx={{ width: "100%", justifyContent: "center", }}>
          <IconButton onClick={() => setOpen(true)}>
            <AddIcon />
          </IconButton>
          {amenityDialog()}
          <Sheet
            variant="outlined"
            sx={{
              "--TableCell-height": "40px",
              // the number is the amount of the header rows.
              "--TableHeader-height": "calc(1 * var(--TableCell-height))",
              "--Table-firstColumnWidth": "80px",
              "--Table-lastColumnWidth": "144px",
              // background needs to have transparency to show the scrolling shadows
              "--TableRow-stripeBackground": "rgba(0 0 0 / 0.04)",
              "--TableRow-hoverBackground": "rgba(0 0 0 / 0.08)",
              overflow: "auto",
              background: (theme) =>
                `linear-gradient(to right, ${theme.vars.palette.background.surface} 30%, rgba(255, 255, 255, 0)),
            linear-gradient(to right, rgba(255, 255, 255, 0), ${theme.vars.palette.background.surface} 70%) 0 100%,
            radial-gradient(
              farthest-side at 0 50%,
              rgba(0, 0, 0, 0.12),
              rgba(0, 0, 0, 0)
            ),
            radial-gradient(
                farthest-side at 100% 50%,
                rgba(0, 0, 0, 0.12),
                rgba(0, 0, 0, 0)
              )
              0 100%`,
              backgroundSize:
                "40px calc(100% - var(--TableCell-height)), 40px calc(100% - var(--TableCell-height)), 14px calc(100% - var(--TableCell-height)), 14px calc(100% - var(--TableCell-height))",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "local, local, scroll, scroll",
              backgroundPosition:
                "var(--Table-firstColumnWidth) var(--TableCell-height), calc(100% - var(--Table-lastColumnWidth)) var(--TableCell-height), var(--Table-firstColumnWidth) var(--TableCell-height), calc(100% - var(--Table-lastColumnWidth)) var(--TableCell-height)",
              backgroundColor: "background.surface",
            }}>
            <Table
              borderAxis="bothBetween"
              stripe="odd"
              hoverRow
              sx={{
                "& tr > *:first-child": {
                  position: "sticky",
                  left: 0,
                  width: 1200,
                  boxShadow: "1px 0 var(--TableCell-borderColor)",
                  bgcolor: "background.surface",
                },
                "& tr > *:last-child": {
                  position: "sticky",
                  right: 0,
                  bgcolor: "var(--TableCell-headBackground)",
                },
              }}>
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: 300 }}>
                    Description
                  </TableCell>
                  <TableCell style={{ width: 300 }}>Rate&nbsp;(R)</TableCell>
                  <TableCell
                    aria-label="last"
                    style={{ width: 200 }}
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {amenities.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell><Typography color="primary">{row.description}</Typography></TableCell>
                    <TableCell><Typography color="warning">{row.rate}</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton onClick={() => handleEditClick(row)} size="sm" variant="plain" color="info">
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteClick(row.id)} size="sm" variant="soft" color="danger">
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Sheet>
        </Box>
        <>
          <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
            <ModalDialog variant="outlined" role="alertdialog">
              <DialogTitle>
                <WarningRoundedIcon />
                Delete Amenity.
              </DialogTitle>
              <DialogContent>
                Are you sure you want to remove this amenity?
              </DialogContent>
              <DialogActions>
                <Button variant="solid" color="danger" onClick={() => deleteAmenity()}>
                  Continue
                </Button>
                <Button variant="plain" color="neutral" onClick={() => setOpenDelete(false)}>
                  Cancel
                </Button>
              </DialogActions>
            </ModalDialog>
          </Modal>
        </>
      </>
    ) : (
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
        }}>
        <CircularProgress thickness={1} />
      </Box>
    )
  ) : (
    <Box
      sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
      <CircularProgress thickness={1} />
    </Box>
  );
}
