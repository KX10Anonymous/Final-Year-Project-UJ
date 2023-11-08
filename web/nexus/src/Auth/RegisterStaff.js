import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import NativeSelect from "@mui/material/NativeSelect";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useUser } from "./UserProvider";

export default function RegisterStaff({updateIsChanged, isChanged}) {
  const user = useUser();
  const [name, setName] = React.useState("");
  const [surname, setSurname] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phoneEntry, setPhone] = React.useState("");
  const [role, setRole] = React.useState("");
  const [firstNameInputError, setFirstNameErrorMessage] = React.useState("");
  const [lastNameInputError, setLastNameErrorMessage] = React.useState("");
  const [roleError, setRoleErrorMessage] = React.useState("");
  const [emailInputError, setEmailErrorMessage] = React.useState("");
  const [phoneInputError, setPhoneErrorMessage] = React.useState("");


  const validateEmailEntry = (emailInput) => {
    const validEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return validEmailPattern.test(emailInput);
  };

  const handleEmailEntryChange = async (event) => {
    const emailInput = event.target.value;
    setEmailErrorMessage(emailInput);
    const isValidEmail = validateEmailEntry(emailInput);
    if (!isValidEmail) {
      setEmailErrorMessage("Invalid Email!!");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:8080/nexus/api/users/email-check/" + emailInput,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      let isEmailExists = true;
      if (data.exists === false) {
        isEmailExists = false;
      }

      if (isEmailExists) {
        setEmailErrorMessage("Email Already Exists!!");
      } else {
        setEmailErrorMessage("");
        setEmail(emailInput);
      }
    } catch (error) {
      console.log("Error Checking Email Existence!!");
    }
  };

  const handleFirstNameChange = (e) => {
    const name = e.target.value;

    if (!name) {
      setFirstNameErrorMessage("First Name Is Required!!");
    } else if (!validateName(name)) {
      setFirstNameErrorMessage("Invalid First Name!!");
    } else {
      setFirstNameErrorMessage("");
      setName(name);
    }
  };

  const handleLastNameChange = (e) => {
    const name = e.target.value;
    if (!name) {
      setLastNameErrorMessage("Last Name Is Required!!");
    } else if (!validateName(name)) {
      setLastNameErrorMessage("Invalid Last Name!!");
    } else {
      setLastNameErrorMessage("");
      setSurname(name);
    }
  };

  const handleRoleEntryChange = (e) => {
    const roleInput = e.target.value;
    if (!roleInput) {
      setRoleErrorMessage("Role Is Required!!");
    } else {
      setRoleErrorMessage("");
      setRole(roleInput);
    }
  };

  const validateName = (name) => {
    const valNamePattern = /^[a-zA-Z\s\-']+$/;

    const minLength = 2;
    const maxLength = 30;

    if (!valNamePattern.test(name)) {
      return false;
    }

    if (name.length < minLength || name.length > maxLength) {
      return false;
    }

    const consecEmptySpaces = /\s{2,}/;
    if (consecEmptySpaces.test(name)) {
      return false;
    }

    const disallowedCharacters = /[!@#$%^&*()_+=[\]{};':"\\|,.<>/?0-9]/;
    if (disallowedCharacters.test(name)) {
      return false;
    }

    const startsWithLetter = /^[a-zA-Z]/;
    const endsWithLetter = /[a-zA-Z]$/;
    if (!startsWithLetter.test(name) || !endsWithLetter.test(name)) {
      return false;
    }

    const words = name.trim().split(/\s+/);
    const maxWordCount = 2;
    if (words.length > maxWordCount) {
      return false;
    }
    const hasValidCharacters = /^[\p{L}\p{M}'\s-]+$/u.test(name);
    const hasNoRepeatedCharacters = !/(.)\1{2}/.test(name);
    return !(!hasValidCharacters || !hasNoRepeatedCharacters);
  };

  const handleSubmit = () => {
    if (user.role === "OWNER" || user.role === "MANAGER") {
      const reqBody = {
        email: email,
        firstname: name,
        lastname: surname,
        phone: phoneEntry,
        role: role,
      };

      if (
        !firstNameInputError &&
        !lastNameInputError &&
        !emailInputError &&
        !roleError &&
        !phoneInputError
      ) {
        try {
          fetch("http://localhost:8080/nexus/api/users/register/" + user.jwt, {
            headers: {
              "Content-Type": "application/json",
            },
            method: "post",
            body: JSON.stringify(reqBody),
          })
            .then((response) => {
              if (response.status === 200) {
                response.json().then((data) => {
                  if (data) {
                    if(isChanged === true){
                      updateIsChanged(false);
                    }else{
                      updateIsChanged(true);
                    }
                    alert("New Staff User Saved");
                  }
                });
              }
            })
            .catch((message) => {
              console.error("Did Not Create User");
            });
        } catch (error) {
          console.log(
            "Error Occurred While trying To Create New Staff User"
          );
        }
      }else{
        alert("Fix your inputs!!.")
      }
    }
  };

  const handlePhoneChange = (event) => {
    const phone = event.target.value;
    if (!phone) {
      setPhoneErrorMessage("Phone Number Is Required!!");
    } else if (
      !/^061\d{7}$/.test(phone) &&
      !/^062\d{7}$/.test(phone) &&
      !/^063\d{7}$/.test(phone) &&
      !/^064\d{7}$/.test(phone) &&
      !/^065\d{7}$/.test(phone) &&
      !/^067\d{7}$/.test(phone) &&
      !/^068\d{7}$/.test(phone) &&
      !/^069\d{7}$/.test(phone) &&
      !/^071\d{7}$/.test(phone) &&
      !/^072\d{7}$/.test(phone) &&
      !/^073\d{7}$/.test(phone) &&
      !/^074\d{7}$/.test(phone) &&
      !/^074\d{7}$/.test(phone) &&
      !/^076\d{7}$/.test(phone) &&
      !/^078\d{7}$/.test(phone) &&
      !/^079\d{7}$/.test(phone) &&
      !/^081\d{7}$/.test(phone) &&
      !/^082\d{7}$/.test(phone) &&
      !/^083\d{7}$/.test(phone) &&
      !/^084\d{7}$/.test(phone)
    ) {
      setPhoneErrorMessage("Invalid Phone Number!!");
    } else {
      phoneExists(phone);
      setPhoneErrorMessage("");
      setPhone(phone);
    }
    
  };

  const phoneExists = async (phone) => {
    try {
      const response = await fetch(
        "http://localhost:8080/nexus/api/users/phone-check/" + phone,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (data.exists === false) {
        setPhoneErrorMessage("");
      }else if (data.exists === true) {
        setPhoneErrorMessage("Phone Entered Already Exists");
      } else {
        setPhoneErrorMessage("");
      }
    } catch (error) {
      console.log("Error Number Existence");
    }
  };

  return (
      <Paper
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Add Staff User Account.
        </Typography>
        <Box component="form" noValidate sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
                error={!!firstNameInputError}
                helperText={firstNameInputError}
                onChange={handleFirstNameChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                error={!!lastNameInputError}
                helperText={lastNameInputError}
                onChange={handleLastNameChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Personal Email"
                name="email"
                autoComplete="email"
                error={!!emailInputError}
                helperText={emailInputError}
                onChange={handleEmailEntryChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="phone"
                label="Phone"
                name="phone"
                autoComplete="phone"
                error={!!phoneInputError}
                helperText={phoneInputError}
                onChange={handlePhoneChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel variant="standard" htmlFor="uncontrolled-native">
                  Role
                </InputLabel>
                <NativeSelect
                  defaultValue="Role"
                  error={!!roleError}
                  helperText={roleError}
                  onChange={handleRoleEntryChange}
                  inputProps={{
                    name: "role",
                    id: "uncontrolled-native",
                  }}>
                  <option value=""></option>
                  <option value="CLERK">CLERK</option>
                  <option value="MANAGER">MANAGER</option>
                </NativeSelect>
              </FormControl>
            </Grid>
          </Grid>
          <Button
            onClick={() => handleSubmit()}
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}>
            Save User
          </Button>
        </Box>
      </Paper>
  );
}
