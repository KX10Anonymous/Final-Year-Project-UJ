import { Dashboard } from "@mui/icons-material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import MoreIcon from "@mui/icons-material/MoreVert";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { ClickAwayListener, Divider, Paper, Popper } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Auth/UserProvider";

export default function NavBar({ isBookingCreated }) {
  const user = useUser();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRead, setIsRead] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const jwt = sessionStorage.getItem("jwt");
      const role = sessionStorage.getItem("role");
      const fullName = sessionStorage.getItem("fullName");
      const refresh = sessionStorage.getItem("refresh");

      if (jwt && role && fullName && refresh) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };
    checkLogin();
  }, [user]);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleShowNotifications = (event) => {
    setOpen(true);
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleHomeClick = () => {
    navigate("/home");
  };
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (user.role === "GUEST") {
          await fetch(
            "http://localhost:8080/nexus/api/notifications/all/" + user.jwt,
            {
              headers: {
                "Content-Type": "application/json",
              },
              method: "get",
            }
          )
            .then(async (response) => {
              try {
                if (response.status === 200) {
                  const data = await response.json();
                  if (data) {
                    setNotifications(data);
                  }
                } else if (response.status === 204) {
                  console.log("No Content Found");
                }
              } catch (error) {
                console.log("Error parsing JSON");
              }
            })
            .catch((message) => {
              console.log("Error Occured Reading Notifications");
            });
        } else {
          console.log("Not Authorized To Make This Action.");
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [isLoggedIn, user, isRead]);

  const handleNotificationClick = async (notification) => {
    try {
      const reqBody = {
        id: notification.id,
      };
      await fetch(
        "http://localhost:8080/nexus/api/notifications/update/" + user.jwt,
        {
          method: "PUT",
          body: JSON.stringify(reqBody),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.log("Error Updating Notifications");
    }
    if (isRead) {
      setIsRead(false);
    } else {
      setIsRead(true);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleInvoicesClick = () => {
    if (user) {
      navigate("/invoices");
    }
  };

  const handleProfileClick = () => {
    if (user) {
      navigate("/profile");
    }
  };

  const handleDashboardClick = () => {
    if (user) {
      navigate("/dashboard");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/nexus/api/auth/logout/" + user.jwt, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      user.setJwt("");
      user.setRole("");
      user.setFullName("");
      user.setRefreshToken("");

      sessionStorage.removeItem("jwt");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("fullName");
      sessionStorage.removeItem("refresh");
      setIsLoggedIn(false);

      navigate("/login");
    } catch (error) {
      console.log("Logout Request Failed!!");
    }
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}>
      <MenuItem onClick={() => handleProfileClick()}>Profile</MenuItem>
    </Menu>
  );

  const renderNotifications = () => {
    return (
      <>
        {notifications ? (
          notifications.map((notification) => (
            <div key={notification.id}>
              <Button onClick={() => handleNotificationClick(notification)}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar
                      alt={notification.recipientName}
                      src={notification.recipientAvatar}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.message}
                    secondary={notification.created}
                  />
                </ListItem>
              </Button>
              <Divider />
            </div>
          ))
        ) : (
          <></>
        )}
      </>
    );
  };

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}>
      <MenuItem>
        <IconButton
          size="large"
          color="inherit"
          onClick={(e) => handleShowNotifications(e)}>
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
        <Popper open={open} anchorEl={notificationsAnchorEl} placement="top">
          <ClickAwayListener onClickAway={() => setOpen(false)}>
            <Paper sx={{ maxHeight: "300px", overflowY: "auto" }}>
              {renderNotifications()}
            </Paper>
          </ClickAwayListener>
        </Popper>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit">
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
      <MenuItem>
        <IconButton size="large" color="inherit">
          <LoginIcon />
        </IconButton>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}></IconButton>
          <Button
            onClick={() => handleHomeClick()}
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: "none", sm: "block" } }}>
            nexus
          </Button>

          <Box sx={{ flexGrow: 1 }} />
          {user && user.jwt && isLoggedIn === true ? (
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              {user.role === "GUEST" && isLoggedIn ? (
                <>
                  <IconButton
                    size="small"
                    aria-label=""
                    onClick={() => handleInvoicesClick()}>
                    <Chip
                      label="Invoices"
                      variant="outlined"
                      icon={<Dashboard />}
                    />
                  </IconButton>
                  <IconButton
                    size="large"
                    aria-label=""
                    color="inherit"
                    onClick={(e) => handleShowNotifications(e)}>
                    <Badge badgeContent={notifications.length} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </>
              ) : (
                <></>
              )}

              {(user.role === "MANAGER" || user.role === "OWNER") &&
              isLoggedIn === true ? (
                <>
                  <IconButton
                    size="small"
                    aria-label=""
                    onClick={() => handleDashboardClick()}>
                    <Chip
                      label="Dashboard"
                      variant="outlined"
                      icon={<Dashboard />}
                    />
                  </IconButton>
                </>
              ) : (
                <></>
              )}
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit">
                <AccountCircle />
              </IconButton>
              <IconButton
                size="large"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleLogout}
                color="inherit">
                <LogoutIcon />
              </IconButton>
            </Box>
          ) : (
            <></>
          )}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit">
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
    </Box>
  );
}
