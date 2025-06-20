"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  Container,
  Fade,
  Slide,
  Zoom,
  Avatar,
} from "@mui/material"
import {
  People,
  LocalShipping,
  Article,
  ContactMail,
  Work,
  AssignmentInd,
  Star,
  Refresh,
  TrendingUp,
  TrendingDown,
  VisibilityOutlined,
  NotificationsOutlined,
  Close,
  Timeline,
  Speed,
  Analytics,
} from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import { format, formatDistanceToNow } from "date-fns"
import DashboardAnalytics from "../components/DashboardAnalytics"

const statIcons = {
  services: <LocalShipping />,
  blogs: <Article />,
  contacts: <ContactMail />,
  users: <People />,
  jobs: <Work />,
  applications: <AssignmentInd />,
  testimonials: <Star />,
  shipments: <LocalShipping />,
}

const statColors = {
  services: "#86c517",
  blogs: "#68a80d",
  contacts: "#9ed320",
  users: "#b8e034",
  jobs: "#7bb518",
  applications: "#5c950b",
  testimonials: "#4a7a09",
  shipments: "#86c517",
}

// Styled Components
const ModernContainer = styled(Container)(({ theme }) => ({
  background: "linear-gradient(135deg, #f8fffe 0%, #ffffff 100%)",
  minHeight: "100vh",
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(4),
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

const StatsCard = styled(Card)(({ theme, color }) => ({
  borderRadius: "24px",
  background: "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(134, 197, 23, 0.1)",
  boxShadow: "0 8px 32px rgba(134, 197, 23, 0.08)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover": {
    transform: "translateY(-12px) scale(1.02)",
    boxShadow: "0 25px 50px rgba(134, 197, 23, 0.15)",
    "&::before": {
      opacity: 1,
    },
  },
}))

const ModernTabs = styled(Tabs)(({ theme }) => ({
  background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
  backdropFilter: "blur(20px)",
  borderRadius: "20px",
  border: "1px solid rgba(134, 197, 23, 0.1)",
  padding: theme.spacing(1),
  marginBottom: theme.spacing(4),
  "& .MuiTab-root": {
    textTransform: "none",
    fontWeight: 600,
    borderRadius: "16px",
    margin: theme.spacing(0, 0.5),
    transition: "all 0.3s ease",
    "&.Mui-selected": {
      background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
      color: "white",
      boxShadow: "0 8px 20px rgba(134, 197, 23, 0.3)",
    },
  },
  "& .MuiTabs-indicator": {
    display: "none",
  },
}))

const ActivityCard = styled(Paper)(({ theme }) => ({
  borderRadius: "20px",
  background: "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(134, 197, 23, 0.1)",
  boxShadow: "0 8px 32px rgba(134, 197, 23, 0.08)",
  padding: theme.spacing(3),
  position: "relative",
  overflow: "hidden",
}))

const ModernListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: "16px",
  marginBottom: theme.spacing(1),
  transition: "all 0.3s ease",
  background: "rgba(134, 197, 23, 0.02)",
  border: "1px solid rgba(134, 197, 23, 0.05)",
  "&:hover": {
    background: "rgba(134, 197, 23, 0.08)",
    transform: "translateX(8px)",
    boxShadow: "0 4px 20px rgba(134, 197, 23, 0.1)",
  },
}))

const HeaderSection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
  borderRadius: "32px",
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
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

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activityFilter, setActivityFilter] = useState("all")
  const [activityLimit, setActivityLimit] = useState(10)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [analytics, setAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsPeriod, setAnalyticsPeriod] = useState("30d")
  const [notifications, setNotifications] = useState([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      })
      if (response.status === 401) {
        setError("You are not logged in. Please log in to view the dashboard.")
        setStats(null)
        return
      }
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
        setError(null)
      } else {
        setError(data.message || "Failed to load dashboard stats")
      }
    } catch (err) {
      setError("Failed to load dashboard stats")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Fetch recent activities
  const fetchActivities = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/dashboard/recent-activity?limit=${activityLimit}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      })
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        setError("Failed to load activities: Server returned non-JSON response")
        return
      }
      const data = await response.json()

      if (data.success) {
        setActivities(data.data || [])
      }
    } catch (err) {
      setError("Failed to load activities")
    } finally {
      setActivityLoading(false)
    }
  }, [activityLimit])

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/dashboard/analytics?period=${analyticsPeriod}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      })
      const data = await response.json()

      if (data.success) {
        setAnalytics(data.data)
      }
    } catch (err) {
      console.error("Failed to load analytics:", err)
    } finally {
      setAnalyticsLoading(false)
    }
  }, [analyticsPeriod])

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/dashboard/notifications", {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      })
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        setError("Failed to load notifications: Server returned non-JSON response")
        return
      }
      const data = await response.json()

      if (data.success) {
        setNotifications(data.data || [])
      }
    } catch (err) {
      setError("Failed to load notifications")
    }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchNotifications()
  }, [fetchStats, fetchNotifications])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  useEffect(() => {
    if (tabValue === 1) {
      fetchAnalytics()
    }
  }, [tabValue, fetchAnalytics])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats()
      fetchActivities()
      fetchNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchStats, fetchActivities, fetchNotifications])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchStats()
    fetchActivities()
    fetchNotifications()
    if (tabValue === 1) {
      fetchAnalytics()
    }
  }

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity)
    setDetailsDialogOpen(true)
  }

  const getActivityStatusChip = (activity) => {
    if (activity.type === "shipment" && activity.metadata?.status) {
      return (
        <Chip
          label={activity.metadata.status}
          size="small"
          sx={{
            background:
              activity.metadata.status === "delivered"
                ? "linear-gradient(135deg, #86c517 0%, #68a80d 100%)"
                : "linear-gradient(135deg, #fbc02d 0%, #f57c00 100%)",
            color: "white",
            fontWeight: 600,
          }}
        />
      )
    }
    if (activity.type === "contact" && activity.metadata?.isRead !== undefined) {
      return (
        <Chip
          label={activity.metadata.isRead ? "Read" : "Unread"}
          size="small"
          sx={{
            background: activity.metadata.isRead
              ? "linear-gradient(135deg, #86c517 0%, #68a80d 100%)"
              : "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
            color: "white",
            fontWeight: 600,
          }}
        />
      )
    }
    if (activity.type === "blog" && activity.metadata?.isPublished !== undefined) {
      return (
        <Chip
          label={activity.metadata.isPublished ? "Published" : "Draft"}
          size="small"
          sx={{
            background: activity.metadata.isPublished
              ? "linear-gradient(135deg, #86c517 0%, #68a80d 100%)"
              : "linear-gradient(135deg, #9e9e9e 0%, #757575 100%)",
            color: "white",
            fontWeight: 600,
          }}
        />
      )
    }
    return null
  }

  const filteredActivities =
    activityFilter === "all" ? activities : activities.filter((activity) => activity.type === activityFilter)

  const statList = stats?.overview
    ? [
        {
          key: "services",
          title: "Total Services",
          value: stats.overview.services.total,
          subValue: `${stats.overview.services.published} published`,
          icon: statIcons.services,
          color: statColors.services,
          trend: stats.recentActivity?.services,
        },
        {
          key: "blogs",
          title: "Blog Posts",
          value: stats.overview.blogs.total,
          subValue: `${stats.overview.blogs.published} published`,
          icon: statIcons.blogs,
          color: statColors.blogs,
          trend: stats.recentActivity?.blogs,
        },
        {
          key: "shipments",
          title: "Shipments",
          value: stats.overview.shipments.total,
          subValue: `${stats.overview.shipments.active} active`,
          icon: statIcons.shipments,
          color: statColors.shipments,
          trend: stats.recentActivity?.shipments,
        },
        {
          key: "contacts",
          title: "Contacts",
          value: stats.overview.contacts.total,
          subValue: `${stats.overview.contacts.unread} unread`,
          icon: statIcons.contacts,
          color: statColors.contacts,
          trend: stats.recentActivity?.contacts,
        },
        {
          key: "users",
          title: "Users",
          value: stats.overview.users.total,
          icon: statIcons.users,
          color: statColors.users,
        },
        {
          key: "jobs",
          title: "Jobs",
          value: stats.overview.jobs.total,
          subValue: `${stats.overview.jobs.active} active`,
          icon: statIcons.jobs,
          color: statColors.jobs,
        },
        {
          key: "applications",
          title: "Applications",
          value: stats.overview.applications.total,
          icon: statIcons.applications,
          color: statColors.applications,
          trend: stats.recentActivity?.applications,
        },
        {
          key: "testimonials",
          title: "Testimonials",
          value: stats.overview.testimonials.published,
          icon: statIcons.testimonials,
          color: statColors.testimonials,
        },
      ]
    : []

  return (
    <ModernContainer maxWidth="xl">
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {/* Header Section */}
        <Fade in timeout={800}>
          <HeaderSection>
            <Box display="flex" justifyContent="space-between" alignItems="center" position="relative" zIndex={1}>
              <Box>
                <Typography variant="h3" fontWeight="800" gutterBottom sx={{ mb: 1 }}>
                  Dashboard Overview
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                  Monitor your logistics operations and performance metrics
                </Typography>
              </Box>
              <Box display="flex" gap={2} alignItems="center">
                <IconButton
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{
                    background: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    "&:hover": { background: "rgba(255, 255, 255, 0.3)" },
                  }}
                >
                  <Refresh sx={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
                </IconButton>
                <Badge badgeContent={notifications.length} color="error">
                  <IconButton
                    onClick={() => setNotificationsOpen(true)}
                    sx={{
                      background: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      "&:hover": { background: "rgba(255, 255, 255, 0.3)" },
                    }}
                  >
                    <NotificationsOutlined />
                  </IconButton>
                </Badge>
              </Box>
            </Box>
          </HeaderSection>
        </Fade>

        {/* Tabs */}
        <Slide direction="up" in timeout={1000}>
          <Box>
            <ModernTabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} variant="fullWidth">
              <Tab
                icon={<Speed sx={{ mr: 1 }} />}
                label="Overview"
                iconPosition="start"
                sx={{ fontSize: "1rem", fontWeight: 600 }}
              />
              <Tab
                icon={<Analytics sx={{ mr: 1 }} />}
                label="Analytics"
                iconPosition="start"
                sx={{ fontSize: "1rem", fontWeight: 600 }}
              />
            </ModernTabs>
          </Box>
        </Slide>

        {tabValue === 0 && (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {loading ? (
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress sx={{ color: "#86c517" }} size={40} />
                  </Box>
                </Grid>
              ) : (
                statList.slice(0, 4).map((stat, index) => (
                  <Grid item xs={12} sm={6} md={3} key={stat.key}>
                    <Zoom in timeout={800 + index * 100}>
                      <StatsCard color={stat.color}>
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box flex={1}>
                              <Typography
                                color="text.secondary"
                                gutterBottom
                                variant="body2"
                                sx={{ fontWeight: 600, fontSize: "0.9rem" }}
                              >
                                {stat.title}
                              </Typography>
                              <Typography variant="h3" sx={{ fontWeight: 800, color: stat.color, mb: 1 }}>
                                {stat.value}
                              </Typography>
                              {stat.subValue && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                  {stat.subValue}
                                </Typography>
                              )}
                              {stat.trend !== undefined && (
                                <Box display="flex" alignItems="center" mt={1}>
                                  {stat.trend > 0 ? (
                                    <TrendingUp fontSize="small" sx={{ color: "#86c517" }} />
                                  ) : (
                                    <TrendingDown fontSize="small" sx={{ color: "#f44336" }} />
                                  )}
                                  <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 600 }}>
                                    {stat.trend} this month
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                            <Avatar
                              sx={{
                                width: 56,
                                height: 56,
                                background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                                boxShadow: `0 8px 20px ${stat.color}40`,
                              }}
                            >
                              {stat.icon}
                            </Avatar>
                          </Box>
                        </CardContent>
                      </StatsCard>
                    </Zoom>
                  </Grid>
                ))
              )}
            </Grid>

            {/* Recent Activities */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Fade in timeout={1200}>
                  <ActivityCard>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={3}
                      flexWrap="wrap"
                      gap={2}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)" }}>
                          <Timeline />
                        </Avatar>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: "#2d3748" }}>
                            Recent Activities
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Latest updates and changes in your system
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" gap={2} flexWrap="wrap">
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <InputLabel>Filter</InputLabel>
                          <Select
                            value={activityFilter}
                            label="Filter"
                            onChange={(e) => setActivityFilter(e.target.value)}
                            sx={{ borderRadius: "12px" }}
                          >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="shipment">Shipments</MenuItem>
                            <MenuItem value="contact">Contacts</MenuItem>
                            <MenuItem value="blog">Blogs</MenuItem>
                            <MenuItem value="application">Applications</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 80 }}>
                          <InputLabel>Show</InputLabel>
                          <Select
                            value={activityLimit}
                            label="Show"
                            onChange={(e) => setActivityLimit(e.target.value)}
                            sx={{ borderRadius: "12px" }}
                          >
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={20}>20</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>

                    {activityLoading ? (
                      <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress size={24} sx={{ color: "#86c517" }} />
                      </Box>
                    ) : filteredActivities.length === 0 ? (
                      <Box textAlign="center" py={4}>
                        <Typography color="text.secondary" variant="h6">
                          No activities found
                        </Typography>
                        <Typography color="text.secondary">Activities will appear here as they occur</Typography>
                      </Box>
                    ) : (
                      <List dense>
                        {filteredActivities.map((activity, idx) => (
                          <Fade in timeout={300 + idx * 50} key={`${activity.type}-${activity.id}-${idx}`}>
                            <ModernListItem button onClick={() => handleActivityClick(activity)}>
                              <ListItemIcon>
                                <Avatar
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    background: `linear-gradient(135deg, ${statColors[activity.type] || "#86c517"} 0%, ${statColors[activity.type] || "#68a80d"} 100%)`,
                                  }}
                                >
                                  {statIcons[activity.type] || <AssignmentInd />}
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#2d3748" }}>
                                      {activity.title}
                                    </Typography>
                                    {getActivityStatusChip(activity)}
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2" component="span" sx={{ color: "text.secondary" }}>
                                      {activity.description}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ float: "right", color: "#86c517", fontWeight: 600 }}
                                    >
                                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ModernListItem>
                          </Fade>
                        ))}
                      </List>
                    )}
                  </ActivityCard>
                </Fade>
              </Grid>
            </Grid>

            {/* Top Content */}
            {stats?.topContent?.blogs && stats.topContent.blogs.length > 0 && (
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <Fade in timeout={1400}>
                    <ActivityCard>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <Avatar sx={{ background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)" }}>
                          <Star />
                        </Avatar>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: "#2d3748" }}>
                            Top Blog Posts
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Most popular content by views and engagement
                          </Typography>
                        </Box>
                      </Box>
                      <List dense>
                        {stats.topContent.blogs.map((blog, idx) => (
                          <Fade in timeout={500 + idx * 100} key={blog.id}>
                            <ModernListItem>
                              <ListItemText
                                primary={
                                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#2d3748" }}>
                                    {idx + 1}. {blog.title}
                                  </Typography>
                                }
                                secondary={
                                  <Box display="flex" gap={3} mt={1}>
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                      <VisibilityOutlined fontSize="small" sx={{ color: "#86c517" }} />
                                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                        {blog.viewsCount} views
                                      </Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                      <Star fontSize="small" sx={{ color: "#fbc02d" }} />
                                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                        {blog.likesCount} likes
                                      </Typography>
                                    </Box>
                                  </Box>
                                }
                              />
                            </ModernListItem>
                          </Fade>
                        ))}
                      </List>
                    </ActivityCard>
                  </Fade>
                </Grid>
              </Grid>
            )}
          </>
        )}

        {tabValue === 1 && (
          <Box>
            <Box display="flex" justifyContent="flex-end" mb={3}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Period</InputLabel>
                <Select
                  value={analyticsPeriod}
                  label="Period"
                  onChange={(e) => setAnalyticsPeriod(e.target.value)}
                  sx={{ borderRadius: "12px" }}
                >
                  <MenuItem value="7d">Last 7 days</MenuItem>
                  <MenuItem value="30d">Last 30 days</MenuItem>
                  <MenuItem value="90d">Last 90 days</MenuItem>
                  <MenuItem value="1y">Last year</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {analyticsLoading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress sx={{ color: "#86c517" }} size={40} />
              </Box>
            ) : analytics ? (
              <DashboardAnalytics analytics={analytics} period={analyticsPeriod} />
            ) : null}
          </Box>
        )}
      </Box>

      {/* Activity Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(134, 197, 23, 0.1)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#2d3748" }}>
              Activity Details
            </Typography>
            <IconButton onClick={() => setDetailsDialogOpen(false)} sx={{ color: "text.secondary" }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedActivity && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: "#2d3748", fontWeight: 600 }}>
                {selectedActivity.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {selectedActivity.description}
              </Typography>

              {selectedActivity.metadata && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: "#86c517" }}>
                    Details:
                  </Typography>
                  {Object.entries(selectedActivity.metadata).map(([key, value]) => (
                    <Box key={key} display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {typeof value === "boolean" ? (value ? "Yes" : "No") : value || "N/A"}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              <Typography variant="caption" color="text.secondary" display="block" mt={3} sx={{ fontWeight: 500 }}>
                Created: {format(new Date(selectedActivity.createdAt), "PPpp")}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setDetailsDialogOpen(false)}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </ModernContainer>
  )
}

export default Dashboard
