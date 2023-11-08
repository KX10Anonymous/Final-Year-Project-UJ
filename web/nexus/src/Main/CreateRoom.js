import SaveIcon from "@mui/icons-material/Save";
import Button from "@mui/material/Button";
import Card from "@mui/joy/Card";
import CardActions from "@mui/joy/CardActions";
import CardContent from "@mui/joy/CardContent";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import { MDBFile } from "mdb-react-ui-kit";
import React, { useState } from "react";
import { useUser } from "../Auth/UserProvider";

export default function CreateRoom({ handleCloseDialog, updateIsChanged }) {
  const user = useUser();
  const [roomType, setRoomType] = useState("");
  const [file, setFile] = useState(null);
  const [savedAmenities, setSavedAmenities] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [roomRate, setRoomRate] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [fileName, setFileName] = useState("");
  const [open, setOpen] = useState(false);
  const [roomRateError, setRoomRateError] = React.useState("");
  const [roomTypeError, setRoomTypeErrorMessage] = React.useState("");
  const [roomNumberError, setRoomNumberError] = React.useState("");

  React.useEffect(() => {
    const fetchAmenities = async () => {
      try {
        await fetch(
          "http://localhost:8080/nexus/api/amenities/all/" + user.jwt,
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
                setSavedAmenities(data);
              });
            }
          })
          .catch((message) => {
            console.log("Did Not fetch Amenities ");
          });
      } catch (error) {
        console.log(
          "Error Occurred While trying To Read Room Data "
        );
      }
    };
    if (user.role === "OWNER") {
      fetchAmenities();
    }
  }, [user]);

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

  const handleRoomRateChange = (e) => {
    const rate = e.target.value;
    const num = parseInt(e.target.value);
    if (!rate) {
      setRoomRateError("Room Rate Is Required!!");
    } else if (!validateRoomRate(rate)) {
      setRoomRateError("Invalid Input, Only use digits [0-9]");
    } else if (!validateRoomRateRange(num)) {
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

  const validateRoomRateRange = (rateEntry) => {
    return rateEntry >= 100 && rateEntry <= 999;
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile({ file: selectedFile, originalName: selectedFile.name });
      setFileName(selectedFile.name);
      console.log(fileName);
    }
  };


  const handleAmenities = (e) => {
    const amenity = e.target.value;
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((item) => item !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const saveRoom = () => {
    if (!roomRateError && !roomTypeError && !roomNumberError) {
      if (user.role === "OWNER") {
        const reqBody = {
          type: roomType,
          rate: roomRate,
          resource: file.originalName,
          amenities: amenities,
          roomNumber: roomNumber,
        };

        fetch("http://localhost:8080/nexus/api/rooms/create/" + user.jwt, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "post",
          body: JSON.stringify(reqBody),
        })
          .then((response) => response.json())
          .then((data) => {
            const id = data.id;
            const formData = new FormData();
            formData.append("file", file.file);
            const upload = fetch(
              "http://localhost:8080/nexus/api/rooms/upload/" + id,
              {
                method: "POST",
                body: formData,
              }
            )
              .then((response) => {
                if (response.status === 200) {
                  updateIsChanged();
                } else {
                  updateIsChanged();
                }
              })
              .catch((error) => {
                console.log("Error Creating Room");
              });

            updateIsChanged();
            return upload;
          })
          .catch((error) => {
            console.log("Error Uploading Images");
          });
      }
      handleCloseDialog();
      updateIsChanged();
    } else {
      alert("Follow Required Guidelines on Inputs.");
    }
  };


  if (user.role !== "OWNER") {
    return;
  }

  return (
    <Card
      variant="outlined"
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
      <Divider inset="none" />
      <CardContent
        sx={{
          gridTemplateColumns: "repeat(2, minmax(80px, 1fr))",
          gap: 1.5,
        }}>
          
        <FormControl fullWidth margin="normal">
          <Box component="form" sx={{ display: "flex", flexWrap: "wrap" }}>
            <FormControl sx={{ m: 1, width: "100%" }}>
              <InputLabel htmlFor="demo-dialog-native">Room Type</InputLabel>
              <Select
                native
                error={!!roomTypeError}
                helperText={roomTypeError}
                onChange={handleRoomTypeChange}
                input={
                  <OutlinedInput label="Room Type" id="demo-dialog-native" />
                }>
                <option aria-label="None" value="" />
                <option value="Royal Suite">Royal Suite</option>
                <option value="Executive Suite">Executive Suite</option>
                <option value="Standard">Standard Suite</option>
                <option value="Presidential Suite">Presidential Suite</option>
                <option value="Junior Suite">Junior Suite</option>
                <option value="Apartment">Apartment</option>
              </Select>
            </FormControl>
          </Box>
        </FormControl>

        <FormControl sx={{ m: 1, width: "100%" }} fullWidth margin="normal">
          <TextField
            margin="normal"
            required
            fullWidth
            autoComplete="text"
            autoFocus
            error={!!roomNumberError}
            helperText={roomNumberError}
            onChange={handleRoomNumberChange}
            label="Room Number"
            id="number"
          />
        </FormControl>

        <FormControl sx={{ m: 1, width: "100%" }} fullWidth margin="normal">
          <TextField
            margin="normal"
            required
            fullWidth
            autoComplete="text"
            autoFocus
            error={!!roomRateError}
            helperText={roomRateError}
            onChange={handleRoomRateChange}
            label="Room Rate"
            id="rate"
          />
        </FormControl>

        <FormControl sx={{ width: "100%", mx: "auto" }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              minWidth: 300,
              width: 1000,
            }}>
          </Box>
        </FormControl>

        <FormControl
          sx={{ width: "100%", mx: "auto" }}
          fullWidth
          margin="normal">
          <MDBFile
            sx={{ width: "100%", mx: "auto", height: "200px" }}
            label="Add Images"
            onChange={handleChange}
            fullWidth
            margin="normal"
            name="images"
            id="formFileMultiple"
            accept="image/jpg, image/png, image/jpeg, image/webp"
          />
        </FormControl>

        <FormControl
          sx={{ width: "100%", mx: "auto" }}
          fullWidth
          margin="normal">
          <FormGroup>
            {savedAmenities.map((amenity) => (
              <FormControlLabel
                key={amenity.id}
                control={
                  <Checkbox
                    value={amenity.description}
                    checked={amenities.includes(amenity.description)}
                    onChange={handleAmenities}
                  />
                }
                label={amenity.description}
              />
            ))}
          </FormGroup>
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
            starticon={<SaveIcon />}
            onClick={() => {
              saveRoom();
            }}>
            Save Room
          </Button>
        </CardActions>
      </CardContent>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Room created Successfully!
        </Alert>
      </Snackbar>
    </Card>
  );
}
