import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserProvider";

const defaultTheme = createTheme();

export default function Login() {
  const user = useUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    const jwt = sessionStorage.getItem("jwt");
    const role = sessionStorage.getItem("role");
    const fullName = sessionStorage.getItem("fullName");
    const refresh = sessionStorage.getItem("refresh");

    if (jwt && role && fullName && refresh) {
      user.setJwt(jwt);
      user.setRole(role);
      user.setRefreshToken(refresh);
      user.setFullName(fullName);
      navigate("/home");
    }
  }, [user, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const reqBody = {
      email: data.get("email"),
      password: data.get("password"),
    };
    let device = "BROWSER";
    fetch("http://localhost:8080/nexus/api/auth/login/" + device, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "post",
      body: JSON.stringify(reqBody),
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 204) {
          alert("Wrong Password or Username.");
        } else if (response.status === 401) {
          alert("Account Has Been Locked");
        } else {
          throw new Error("Login Error");
        }
      })
      .then((data) => {
        if (data.jwt && data.role) {
          user.setJwt(data.jwt);
          user.setRole(data.role);
          user.setRefreshToken(data.refresh);
          user.setFullName(data.fullname);
  
          sessionStorage.setItem("refresh", data.refresh);
          sessionStorage.setItem("role", data.role);
          sessionStorage.setItem("fullName", data.fullname);
          sessionStorage.setItem("jwt", data.jwt);
  
          navigate("/home");
        }
      })
      .catch((error) => {
        console.log("Login Error ");
      });
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
            Sign in
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
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
                <Link href="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
