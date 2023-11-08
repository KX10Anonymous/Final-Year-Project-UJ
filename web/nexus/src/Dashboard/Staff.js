import Delete from "@mui/icons-material/DeleteOutlined";
import Mail from "@mui/icons-material/MailOutline";
import Phone from "@mui/icons-material/Phone";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import React from "react";
import { useUser } from "../Auth/UserProvider";
import Divider from "@mui/material/Divider";
import Button from "@mui/joy/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

export default function Staff({ isStaff, isChanged }) {
  const user = useUser();
  const [staff, setStaff] = React.useState([]);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [isRecChanged, setIsChanged] = React.useState(false);
  const [userId, setUserId] = React.useState();

  React.useEffect(() => {
    const fetchStaffInformation = async () => {
      if (isStaff) {
        if (user.role === "MANAGER" || user.role === "OWNER") {
          await fetch(
            "http://localhost:8080/nexus/api/users/staff/" + user.jwt,
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
                  setStaff(data);
                });
              } else if (response.status === 204) {
                console.log("No User Information Found");
              }
            })
            .catch((message) => {
              console.log("Error Reading Profile");
            });
        }
      }
    };
    if (user) {
      fetchStaffInformation();
    }
  }, [user, isStaff, isChanged, isRecChanged]);

  const handleDeactivateClick = (id) => {
    setUserId(id);
    setConfirmDelete(true);
  }

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
                setIsChanged(!isRecChanged);
              }
            });
          }
        })
        .catch((message) => {
          console.log("Error Reading Response");
        });
    } catch (error) {
      console.log("Error Reading Staff");
    }
    setConfirmDelete(false);
  };

  return staff.length > 0 ? (
    <>
      <Table align="middle">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {staff.map((item) => {
            return (
              <>
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="d-flex align-items-center">
                      <div className="ms-3">
                        <p className="fw-bold mb-1">{item.fullname}</p>
                        <p className="text-muted mb-0">
                          <Chip
                            label={item.email}
                            color="success"
                            variant="outlined"
                            icon={<Mail />}
                          />
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="fw-normal mb-1">{item.role}</p>
                    <p className="text-muted mb-0"></p>
                  </TableCell>
                  <TableCell>
                    <Chip label="ACTIVE" color="success" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.phone}
                      color="success"
                      variant="outlined"
                      icon={<Phone />}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDeactivateClick(item.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </>
            );
          })}
        </TableBody>
      </Table>
      <>
        <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)}>
          <ModalDialog variant="outlined" role="alertdialog">
            <DialogTitle>
              <WarningRoundedIcon />
              Deactivate User
            </DialogTitle>
            <Divider />
            <DialogContent>
              Are you sure you want to deactivate this user?
            </DialogContent>
            <DialogActions>
              <Button variant="solid" color="danger" onClick={() => deactivate()}>
                Continue
              </Button>
              <Button variant="plain" color="neutral" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </DialogActions>
          </ModalDialog>
        </Modal>
      </>
    </>
  ) : (
    <></>
  );
}
