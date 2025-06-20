"use client"

import { useState } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Divider,
  Collapse,
  Badge,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Dashboard,
  LocalShipping,
  Article,
  TrackChanges,
  ContactMail,
  Work,
  People,
  RateReview,
  Logout,
  AccountCircle,
  FlightTakeoff,
  Notifications,
  Settings,
  Group,
  Announcement,
  Chat,
  Poll,
  ExpandLess,
  ExpandMore,
  Email,
} from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import { useAuth } from "../context/AuthContext"

const drawerWidth = 280

const menuItems = [
  { text: "Dashboard", icon: <Dashboard />, path: "/" },
  { text: "Services", icon: <LocalShipping />, path: "/services" },
  { text: "Blogs", icon: <Article />, path: "/blogs" },
  { text: "Newsletter Subscribers", icon: <Email />, path: "/newsletter-subscribers" },
  { text: "Tracking", icon: <TrackChanges />, path: "/tracking" },
  { text: "Contacts", icon: <ContactMail />, path: "/contacts" },
  { text: "Jobs", icon: <Work />, path: "/jobs" },
  { text: "Testimonials", icon: <RateReview />, path: "/testimonials" },
  { text: "Users", icon: <People />, path: "/users" },
  { divider: true, label: "Team & Communication" },
  { 
    text: "Team", 
    icon: <Group />, 
    path: "/team",
    badge: { text: "New", color: "primary" }
  },
  { 
    text: "Communication", 
    icon: <Announcement />, 
    path: "/communication",
    badge: { text: "New", color: "primary" },
    subItems: [
      { text: "Messages", icon: <Announcement />, path: "/communication?tab=0" },
      { text: "Chat Room", icon: <Chat />, path: "/communication?tab=1" },
      { text: "Surveys", icon: <Poll />, path: "/communication?tab=2" },
    ]
  },
]

// Styled Components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
  backdropFilter: "blur(20px)",
  boxShadow: "0 8px 32px rgba(134, 197, 23, 0.15)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
}))

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    background: "linear-gradient(180deg, #ffffff 0%, #f8fffe 100%)",
    borderRight: "1px solid rgba(134, 197, 23, 0.1)",
    boxShadow: "4px 0 20px rgba(134, 197, 23, 0.08)",
  },
}))

const LogoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(3, 2),
  background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
  color: "white",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)",
    animation: "shimmer 3s ease-in-out infinite",
  },
  "@keyframes shimmer": {
    "0%": { transform: "translateX(-100%)" },
    "100%": { transform: "translateX(100%)" },
  },
}))

const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
  margin: theme.spacing(0.5, 1),
  borderRadius: "12px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: selected ? "linear-gradient(135deg, #86c517 0%, #68a80d 100%)" : "transparent",
    opacity: selected ? 0.1 : 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover": {
    backgroundColor: "rgba(134, 197, 23, 0.08)",
    transform: "translateX(8px)",
    "&::before": {
      opacity: 0.05,
    },
  },
  ...(selected && {
    backgroundColor: "rgba(134, 197, 23, 0.12)",
    color: "#86c517",
    fontWeight: 600,
    "&::after": {
      content: '""',
      position: "absolute",
      right: 0,
      top: "50%",
      transform: "translateY(-50%)",
      width: "4px",
      height: "60%",
      background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
      borderRadius: "2px 0 0 2px",
    },
  }),
}))

const StyledListItemIcon = styled(ListItemIcon)(({ selected }) => ({
  color: selected ? "#86c517" : "inherit",
  minWidth: "40px",
  transition: "all 0.3s ease",
}))

const UserProfileSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  borderRadius: "16px",
  background: "linear-gradient(135deg, rgba(134, 197, 23, 0.05) 0%, rgba(134, 197, 23, 0.02) 100%)",
  border: "1px solid rgba(134, 197, 23, 0.1)",
  backdropFilter: "blur(10px)",
}))

const MainContent = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #f8fffe 0%, #ffffff 100%)",
  minHeight: "100vh",
  position: "relative",
  "&::before": {
    content: '""',
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(134, 197, 23, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(134, 197, 23, 0.03) 0%, transparent 50%)
    `,
    pointerEvents: "none",
    zIndex: 0,
  },
}))

const SectionDivider = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1, 2),
  "& .MuiTypography-root": {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "1.5px",
    color: theme.palette.text.secondary,
    opacity: 0.7,
  },
}))

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [expandedItems, setExpandedItems] = useState({})
  const [unreadMessages, setUnreadMessages] = useState(3) // Example unread count
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
    handleClose()
  }

  const handleExpandClick = (text) => {
    setExpandedItems(prev => ({
      ...prev,
      [text]: !prev[text]
    }))
  }

  const isPathActive = (path) => {
    if (path === "/") {
      return location.pathname === "/"
    }
    return location.pathname.startsWith(path)
  }

  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find((item) => !item.divider && isPathActive(item.path))
    return currentItem?.text || "Admin Panel"
  }

  const handleNavigation = (path) => {
    navigate(path)
    if (isMobile) setMobileOpen(false)
  }

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <LogoContainer>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 2,
            position: "relative",
            zIndex: 1,
          }}
        >
          <FlightTakeoff sx={{ fontSize: 28, color: "white" }} />
        </Box>
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
            Globeflight
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9, fontSize: "0.75rem" }}>
            Admin Dashboard
          </Typography>
        </Box>
      </LogoContainer>

      <Box sx={{ flex: 1, py: 2, overflowY: "auto", overflowX: "hidden" }}>
        <List sx={{ px: 1 }}>
          {menuItems.map((item, index) => {
            if (item.divider) {
              return (
                <SectionDivider key={`divider-${index}`}>
                  <Typography variant="overline">{item.label}</Typography>
                </SectionDivider>
              )
            }

            const isActive = isPathActive(item.path)
            const isExpanded = expandedItems[item.text]

            return (
              <Box key={item.text}>
                <Fade in timeout={300 + index * 50}>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <StyledListItemButton
                      selected={isActive}
                      onClick={() => {
                        if (item.subItems) {
                          handleExpandClick(item.text)
                        } else {
                          handleNavigation(item.path)
                        }
                      }}
                    >
                      <StyledListItemIcon selected={isActive}>
                        {item.text === "Communication" && unreadMessages > 0 ? (
                          <Badge badgeContent={unreadMessages} color="error">
                            {item.icon}
                          </Badge>
                        ) : (
                          item.icon
                        )}
                      </StyledListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 400,
                          fontSize: "0.9rem",
                        }}
                      />
                      {item.badge && (
                        <Chip
                          label={item.badge.text}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.65rem",
                            background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
                            color: "white",
                            fontWeight: 700,
                            animation: "pulse 2s infinite",
                            "@keyframes pulse": {
                              "0%": { opacity: 1 },
                              "50%": { opacity: 0.7 },
                              "100%": { opacity: 1 },
                            },
                          }}
                        />
                      )}
                      {item.subItems && (
                        isExpanded ? <ExpandLess sx={{ ml: 1 }} /> : <ExpandMore sx={{ ml: 1 }} />
                      )}
                    </StyledListItemButton>
                  </ListItem>
                </Fade>
                {item.subItems && (
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem) => (
                        <ListItem key={subItem.text} disablePadding sx={{ mb: 0.5 }}>
                          <StyledListItemButton
                            sx={{ pl: 4, ml: 2 }}
                            selected={location.pathname + location.search === subItem.path}
                            onClick={() => handleNavigation(subItem.path)}
                          >
                            <StyledListItemIcon selected={location.pathname + location.search === subItem.path}>
                              {subItem.icon}
                            </StyledListItemIcon>
                            <ListItemText
                              primary={subItem.text}
                              primaryTypographyProps={{
                                fontSize: "0.85rem",
                                fontWeight: location.pathname + location.search === subItem.path ? 500 : 400,
                              }}
                            />
                          </StyledListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </Box>
            )
          })}
        </List>
      </Box>

      <Divider sx={{ mx: 2 }} />
      
      <UserProfileSection>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
              mr: 1.5,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {user?.fullName?.charAt(0) || "A"}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
              {user?.fullName || "Admin User"}
            </Typography>
            <Chip
              label="Online"
              size="small"
              sx={{
                height: 18,
                fontSize: "0.7rem",
                background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
                color: "white",
                fontWeight: 500,
              }}
            />
          </Box>
        </Box>
      </UserProfileSection>
    </Box>
  )

  return (
    <Box sx={{ display: "flex" }}>
      <StyledAppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ minHeight: "70px !important" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: "none" },
              background: "rgba(255, 255, 255, 0.1)",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
              {getCurrentPageTitle()}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: "0.75rem" }}>
              Manage your logistics operations
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              color="inherit"
              sx={{
                background: "rgba(255, 255, 255, 0.1)",
                "&:hover": { background: "rgba(255, 255, 255, 0.2)" },
              }}
              onClick={() => navigate("/communication")}
            >
              <Badge badgeContent={unreadMessages} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            <IconButton
              color="inherit"
              sx={{
                background: "rgba(255, 255, 255, 0.1)",
                "&:hover": { background: "rgba(255, 255, 255, 0.2)" },
              }}
            >
              <Settings />
            </IconButton>

            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{
                ml: 1,
                background: "rgba(255, 255, 255, 0.1)",
                "&:hover": { background: "rgba(255, 255, 255, 0.2)" },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: "rgba(255, 255, 255, 0.9)",
                  color: "#86c517",
                  fontWeight: 600,
                }}
              >
                {user?.fullName?.charAt(0) || "A"}
              </Avatar>
            </IconButton>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(134, 197, 23, 0.1)",
                  boxShadow: "0 8px 32px rgba(134, 197, 23, 0.15)",
                  minWidth: 180,
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  handleClose()
                  navigate("/team")
                }}
                sx={{
                  borderRadius: "8px",
                  mx: 1,
                  my: 0.5,
                  "&:hover": {
                    background: "rgba(134, 197, 23, 0.08)",
                  },
                }}
              >
                <AccountCircle sx={{ mr: 2, color: "#86c517" }} />
                <Typography variant="body2">My Profile</Typography>
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{
                  borderRadius: "8px",
                  mx: 1,
                  my: 0.5,
                  "&:hover": {
                    background: "rgba(244, 67, 54, 0.08)",
                  },
                }}
              >
                <Logout sx={{ mr: 2, color: "#f44336" }} />
                <Typography variant="body2">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </StyledAppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="navigation menu">
        <StyledDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </StyledDrawer>
        <StyledDrawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawer}
        </StyledDrawer>
      </Box>

      <MainContent
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: "70px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Slide direction="up" in timeout={500}>
          <Box>
            <Outlet />
          </Box>
        </Slide>
      </MainContent>
    </Box>
  )
}

export default Layout