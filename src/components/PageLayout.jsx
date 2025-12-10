import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Auth
import { useAuth } from "../auth/useAuth";

// MUI Components
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";

// MUI Icons
import LogoutIcon from "@mui/icons-material/Logout";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";

function Layout({ children }) {
  const { user, email } = useAuth();
  console.log("user in Layout:", user);
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const open = Boolean(anchorEl);
  const mobileMenuOpen = Boolean(mobileMenuAnchor);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMobileMenuClose();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* AppBar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "white",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          {/* Logo/Brand */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            NFC Sales Handoff
          </Typography>

          {/* Desktop Navigation */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 1,
              ml: 4,
              flex: 1,
            }}
          >
            <Button
              startIcon={<WorkIcon />}
              onClick={() => handleNavigation("/workorders")}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: isActive("/workorders")
                  ? "primary.main"
                  : "text.primary",
                bgcolor: isActive("/workorders") ? "primary.50" : "transparent",
                "&:hover": {
                  bgcolor: isActive("/workorders")
                    ? "primary.100"
                    : "action.hover",
                },
                px: 2,
                borderRadius: 2,
              }}
            >
              Hand Offs
            </Button>
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            sx={{ display: { xs: "flex", md: "none" }, ml: "auto" }}
            onClick={handleMobileMenuOpen}
          >
            <MenuIcon />
          </IconButton>

          {/* User Info & Profile Menu */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 2,
              ml: "auto",
            }}
          >
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {user || "User"}
              </Typography>
              {/*               <Chip
                label={getRoleLabel(user?.role)}
                size="small"
                color={getRoleColor(user?.role)}
                sx={{ height: 20, fontSize: "0.7rem", fontWeight: 500 }}
              /> */}
            </Box>

            <IconButton onClick={handleProfileMenuOpen} size="small">
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 40,
                  height: 40,
                  fontWeight: 600,
                }}
              >
                {getInitials(user)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {user || "User"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {email || "user@example.com"}
          </Typography>
        </Box>
        <Divider />
        {/*         <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem> */}
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error.main">Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {user || "User"}
          </Typography>
          {/*           <Chip
            label={getRoleLabel(user?.role)}
            size="small"
            color={getRoleColor(user?.role)}
            sx={{ mt: 0.5, height: 20, fontSize: "0.7rem" }}
          /> */}
        </Box>
        <Divider />
        <MenuItem onClick={() => handleNavigation("/handoffs")}>
          <ListItemIcon>
            <WorkIcon fontSize="small" />
          </ListItemIcon>
          Hand Offs
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error.main">Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "grey.50",
          minHeight: "calc(100vh - 64px)",
          px: "3vw",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
