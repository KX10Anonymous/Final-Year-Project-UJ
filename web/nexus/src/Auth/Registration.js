import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserProvider";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}>
      {"Copyright © "}
      <Link color="inherit" href="https://nexus.com/">
        nexus.com
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function Registration() {
  const user = useUser();
  const navigate = useNavigate();
  const [email, setEmailObject] = React.useState("");
  const [emailInputError, setEmailMessageError] = React.useState("");
  const [passwordInputError, setPasswordMessageError] = React.useState("");
  const [phoneInputError, setPhoneErrorMessage] = React.useState("");
  const [firstNameInputError, setFirstNameErrorMessage] = React.useState("");
  const [lastNameInputError, setLastNameErrorMessage] = React.useState("");

  React.useEffect(() => {
    if (user.jwt) {
      navigate("/home");
    }
  });

  const validateEmailEntry = (emailInput) => {
    const validEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return validEmailPattern.test(emailInput);
  };

  const handleEmailEntryChange = async (event) => {
    const emailInput = event.target.value;
    setEmailObject(emailInput);
    const isValidEmail = validateEmailEntry(emailInput);
    if (!isValidEmail) {
      setEmailMessageError("Invalid Email!!");
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
        setEmailMessageError("Email Already Exists!!");
      } else {
        setEmailMessageError("");
      }
    } catch (error) {
      console.log("Error Checking Email Existence!!");
    }
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    if (!password) {
      setPasswordMessageError("Password Field Cannot be Left Empty");
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password)) {
      setPasswordMessageError(
        "Password Must Contain At least One Lowercase Letter, One Uppercase letter, and at east One number"
      );
    } else {
      setPasswordMessageError("");
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

      let isPhoneExists = true;
      if (data.exists === false) {
        isPhoneExists = false;
      }
      if (isPhoneExists === true) {
        setPhoneErrorMessage("Phone Entered Already Exists");
      } else {
        setPhoneErrorMessage("");
      }
    } catch (error) {
      console.log("Error Number Existence");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const reqBody = {
      email: data.get("email"),
      password: data.get("password"),
      firstname: data.get("firstname"),
      lastname: data.get("lastname"),
      phone: data.get("phone"),
    };
    fetch("http://localhost:8080/nexus/api/auth/register/BROWSER", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "post",
      body: JSON.stringify(reqBody),
    })
      .then((response) =>
        response.json().then((data) => {
          user.setJwt(data.jwt);
          user.setRole(data.role);
          user.setRefreshToken(data.refresh);
          user.setFullName(data.fullname);
          navigate("/home");
        })
      )
      .catch((message) => {});
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
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
            Sign Up
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="firstname"
              label="First Name"
              name="firstname"
              autoComplete="text"
              autoFocus
              error={!!firstNameInputError}
              helperText={firstNameInputError}
              onChange={handleFirstNameChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="lastname"
              label="Last Name"
              name="lastname"
              autoComplete="text"
              autoFocus
              error={!!lastNameInputError}
              helperText={lastNameInputError}
              onChange={handleLastNameChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              error={!!emailInputError}
              helperText={emailInputError}
              onChange={handleEmailEntryChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="phone"
              label="Contact Number"
              name="phone"
              autoComplete="phone"
              autoFocus
              error={!!phoneInputError}
              helperText={phoneInputError}
              onChange={handlePhoneChange}
            />
            <Divider />
            <Divider />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              error={!!passwordInputError}
              helperText={passwordInputError}
              onChange={handlePasswordChange}
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}>
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/login" variant="body2">
                  {"Have an account? Sign in"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}
