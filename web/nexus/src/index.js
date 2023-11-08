import "@fortawesome/fontawesome-free/css/all.min.css";
import { StyledEngineProvider } from "@mui/joy/styles";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { UserProvider } from "./Auth/UserProvider";
import Footer from "./Main/Footer";
import NavBar from "./Main/NavBar";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <StyledEngineProvider injectFirst>
          <NavBar />
          <App />
          <Footer />
        </StyledEngineProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

reportWebVitals();
