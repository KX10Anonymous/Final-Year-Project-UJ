import InfoOutlined from "@mui/icons-material/InfoOutlined";
import SaveIcon from "@mui/icons-material/Save";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardActions from "@mui/joy/CardActions";
import CardContent from "@mui/joy/CardContent";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import Typography from "@mui/joy/Typography";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import React, { useState } from "react";
import { useUser } from "../Auth/UserProvider";

export default function EditRoom({
  handleCloseDialog,
  id,
  changeIsEdited,
  isEdited,
}) {
  const user = useUser();
  const [roomType, setRoomType] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [room, setRoom] = useState("");
  const initialRoomRate = room ? room.rate : "";
  const [roomRate, setRoomRate] = useState(initialRoomRate);
  const [roomRateError, setRoomRateError] = React.useState("");
  const [roomTypeError, setRoomTypeErrorMessage] = React.useState("");
  const [roomNumberError, setRoomNumberError] = React.useState("");

  React.useEffect(() => {
    const fetchRoomData = async () => {
      if (user && id) {
        try {
          await fetch("http://localhost:8080/nexus/api/rooms/read/" + id, {
            headers: {
              "Content-Type": "application/json",
            },
            method: "GET",
          })
            .then((response) => {
              if (response.status === 200) {
                response.json().then((data) => {
                  setRoom(data);
                });
              }
            })
            .catch((message) => {
              console.log("Did Not fetch Room");
            });
        } catch (error) {
          console.log(
            "Error Occurred While trying To Read Room Data"
          );
        }
      }
    };
    if (user.role === "OWNER") {
      fetchRoomData();
    }
  }, [user, id]);

  const handleRoomTypeChange = (e) => {
    const roomType = e.target.value;

    if (!roomType) {
      setRoomTypeErrorMessage("Select Room Type.");
    } else {
      setRoomTypeErrorMessage("");
      setRoomType(roomType);
    }
  };

  const handleRoomNumberChange = (e) => {
    const roomNumber = e.target.value;
    if (!roomNumber) {
      setRoomNumberError("Room Number Is Required!!");
    } else {
      setRoomNumberError("");
      setRoomNumber(roomNumber);
    }
  };

  const validateRoomRateRange = (rateEntry) =>{
    return rateEntry >= 100 && rateEntry <= 999;
  };

  const handleRoomRateChange = (e) => {
    const rate = e.target.value;
    const num = parseInt(e.target.value);
    if (!rate) {
      setRoomRateError("Room Rate Is Required!!");
    } else if (!validateRoomRate(rate)) {
      setRoomRateError("Invalid Input, Only use digits [0-9]");
    }
    else if(!validateRoomRateRange(num)){
      setRoomRateError("Range Invalid, No Room Costs More Than R999 Per Night");
    } else {
      setRoomRateError("");
      setRoomRate(rate);
    }
  };

  const validateRoomRate = (rateEntry) => {
    const rateRegex = /^[0-9\b]+$/;
    return rateRegex.test(rateEntry);
  };


  const saveRoom = () => {
    if (user.role === "OWNER") {
      const reqBody = {
        id: room.id,
        type: roomType,
        rate: roomRate,
        roomNumber: roomNumber,
      };

      fetch("http://localhost:8080/nexus/api/rooms/edit/" + user.jwt, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "put",
        body: JSON.stringify(reqBody),
      }).then((response) => {
        if (response.status === 200) {
          console.log("Changes Made Successfully");
          if (isEdited === false) {
            changeIsEdited(true);
          } else {
            changeIsEdited(false);
          }
        }
      });
    }
    handleCloseDialog();
  };
  return (
    <Card
      sx={{
        maxHeight: "max-content",
        mx: "auto",
        width: "100%",
        overflow: "auto",
        resize: "horizontal",
        backgroundImage: `url(${process.env.PUBLIC_URL + "/bg.png"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
      <Typography level="h2" fontSize="xl" startDecorator={<InfoOutlined />}>
        Edit Room
      </Typography>
      <Divider inset="none" />
      <CardContent
        sx={{
          gridTemplateColumns: "repeat(2, minmax(80px, 1fr))",
          gap: 1.5,
        }}>
        {user.role === "OWNER" ? (
          room ? (
            <>
              <FormControl fullWidth margin="normal">
                <Box
                  component="form"
                  sx={{ display: "flex", flexWrap: "wrap" }}>
                  <FormControl fullWidth sx={{ m: 1, width: "100%" }}>
                    <InputLabel htmlFor="demo-dialog-native">
                      Room Type
                    </InputLabel>
                    <Select
                      native
                      placeholder={room.type}
                      error={!!roomTypeError}
                      helperText={roomTypeError}
                      onChange={handleRoomTypeChange}
                      input={
                        <OutlinedInput
                          label="Room Type"
                          id="demo-dialog-native"
                        />
                      }>
                      <option>{room.type}</option>
                      <option value="Royal Suite">Royal Suite</option>
                      <option value="Executive">Executive</option>
                      <option value="Standard">Standard Suite</option>
                      <option value="Presidential Suite">
                        Presidential Suite
                      </option>
                      <option value="Junior Suite">Junior Suite</option>
                      <option value="Apartment">Apartment</option>
                    </Select>
                  </FormControl>
                </Box>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel htmlFor="demo-dialog-native">
                  Room Number
                </InputLabel>
                <TextField
                  placeholder={room.roomNumber}
                  margin="normal"
                  required
                  fullWidth
                  autoComplete="text"
                  autoFocus
                  error={!!roomNumberError}
                  helperText={roomNumberError}
                  onChange={handleRoomNumberChange}
                  id="number"
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel htmlFor="demo-dialog-native">Room Rate</InputLabel>
                <TextField
                  placeholder={room.rate}
                  margin="normal"
                  required
                  fullWidth
                  autoComplete="text"
                  autoFocus
                  error={!!roomRateError}
                  helperText={roomRateError}
                  onChange={handleRoomRateChange}
                  id="rate"
                />
              </FormControl>
              <CardActions sx={{ width: "100%", mx: "auto" }}>
                <Button
                  sx={{ width: "100%", mx: "auto" }}
                  variant="solid"
                  color="primary"
                  className="mb-4 w-100 gradient-custom-4"
                  fullWidth
                  margin="normal"
                  type="button"
                  startIcon={<SaveIcon />}
                  onClick={() => {
                    saveRoom();
                  }}>
                  Save Room
                </Button>
              </CardActions>
            </>
          ) : (
            <>Loading.....</>
          )
        ) : (
          <>Not Authoriized</>
        )}
      </CardContent>
    </Card>
  );
}
