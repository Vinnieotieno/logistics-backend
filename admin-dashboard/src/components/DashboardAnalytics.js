"use client"

import { Box, Paper, Typography, Grid, Card, CardContent, Avatar, useTheme, Fade, Zoom } from "@mui/material"
import {
  LocalShipping,
  ContactMail,
  Article,
  MonetizationOn,
  TrendingUp,
  Analytics,
  Speed,
  Timeline,
} from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"

const COLORS = ["#86c517", "#68a80d", "#9ed320", "#b8e034", "#7bb518", "#5c950b"]

const summaryIcons = [
  { icon: <LocalShipping />, color: "#86c517", bg: "rgba(134, 197, 23, 0.1)" },
  { icon: <ContactMail />, color: "#68a80d", bg: "rgba(104, 168, 13, 0.1)" },
  { icon: <Article />, color: "#9ed320", bg: "rgba(158, 211, 32, 0.1)" },
  { icon: <MonetizationOn />, color: "#b8e034", bg: "rgba(184, 224, 52, 0.1)" },
]

// Styled Components
const AnalyticsCard = styled(Card)(({ theme, color }) => ({
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
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: "0 20px 40px rgba(134, 197, 23, 0.15)",
    "&::before": {
      opacity: 1,
    },
  },
}))

const ChartContainer = styled(Paper)(({ theme }) => ({
  borderRadius: "24px",
  background: "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(134, 197, 23, 0.1)",
  boxShadow: "0 8px 32px rgba(134, 197, 23, 0.08)",
  padding: theme.spacing(3),
  position: "relative",
  overflow: "hidden",
}))

const HeaderSection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
  borderRadius: "24px",
  padding: theme.spacing(3),
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

const DashboardAnalytics = ({ analytics, period }) => {
  const theme = useTheme()

  if (!analytics) return null

  // Format data for charts
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    switch (period) {
      case "7d":
        return format(date, "EEE")
      case "30d":
        return format(date, "MMM d")
      case "90d":
        return format(date, "MMM d")
      case "1y":
        return format(date, "MMM yyyy")
      default:
        return format(date, "MMM d")
    }
  }

  // Prepare shipment data
  const shipmentData =
    analytics.analytics?.shipments?.map((item) => ({
      date: formatDate(item.date),
      shipments: item.shipments,
      value: item.totalValue,
      weight: item.avgWeight,
    })) || []

  // Prepare contact data
  const contactData =
    analytics.analytics?.contacts?.map((item) => ({
      date: formatDate(item.date),
      total: item.contacts,
      read: item.read,
      unread: item.unread,
    })) || []

  // Prepare blog data
  const blogData =
    analytics.analytics?.blogs?.map((item) => ({
      date: formatDate(item.date),
      posts: item.blogs,
      views: item.totalViews,
      likes: item.totalLikes,
    })) || []

  // Prepare category performance data for pie chart
  const categoryData =
    analytics.performance?.categories?.slice(0, 6).map((cat) => ({
      name: cat.name,
      value: cat.blogCount,
      views: cat.totalViews,
    })) || []

  // Prepare geographic data
  const geoData = analytics.geographic?.topDestinations || []

  // Summary values
  const totalShipments = shipmentData.reduce((sum, item) => sum + item.shipments, 0)
  const avgWeight = (shipmentData.reduce((sum, item) => sum + item.weight, 0) / (shipmentData.length || 1)).toFixed(2)
  const totalContacts = contactData.reduce((sum, item) => sum + item.total, 0)
  const responseRate =
    contactData.length > 0
      ? (
          (contactData.reduce((sum, item) => sum + item.read, 0) /
            (contactData.reduce((sum, item) => sum + item.total, 0) || 1)) *
          100
        ).toFixed(1)
      : 0
  const totalBlogViews = blogData.reduce((sum, item) => sum + item.views, 0)
  const totalValue = shipmentData.reduce((sum, item) => sum + item.value, 0)

  const summaryCards = [
    {
      label: "Total Shipments",
      value: totalShipments,
      sub: `Avg Weight: ${avgWeight} kg`,
      icon: summaryIcons[0].icon,
      color: summaryIcons[0].color,
      bg: summaryIcons[0].bg,
    },
    {
      label: "Total Contacts",
      value: totalContacts,
      sub: `Response Rate: ${responseRate}%`,
      icon: summaryIcons[1].icon,
      color: summaryIcons[1].color,
      bg: summaryIcons[1].bg,
    },
    {
      label: "Blog Engagement",
      value: totalBlogViews,
      sub: "Total Views",
      icon: summaryIcons[2].icon,
      color: summaryIcons[2].color,
      bg: summaryIcons[2].bg,
    },
    {
      label: "Total Value",
      value: `$${totalValue.toLocaleString()}`,
      sub: "From shipments",
      icon: summaryIcons[3].icon,
      color: summaryIcons[3].color,
      bg: summaryIcons[3].bg,
    },
  ]

  return (
    <Box>
      {/* Header */}
      <Fade in timeout={600}>
        <HeaderSection>
          <Box display="flex" alignItems="center" gap={2} position="relative" zIndex={1}>
            <Avatar sx={{ background: "rgba(255, 255, 255, 0.2)", width: 56, height: 56 }}>
              <Analytics sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="800" gutterBottom>
                Analytics Dashboard
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                Comprehensive insights and performance metrics
              </Typography>
            </Box>
          </Box>
        </HeaderSection>
      </Fade>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Zoom in timeout={800 + idx * 100}>
              <AnalyticsCard color={card.color}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        bgcolor: card.color,
                        color: "#fff",
                        width: 56,
                        height: 56,
                        boxShadow: `0 8px 20px ${card.color}40`,
                      }}
                    >
                      {card.icon}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        {card.label}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: card.color, mb: 0.5 }}>
                        {card.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {card.sub}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </AnalyticsCard>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Shipments Trend */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={1000}>
            <ChartContainer>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar sx={{ background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)" }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#2d3748" }}>
                    Shipments Trend
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track shipment volume over time
                  </Typography>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={shipmentData}>
                  <defs>
                    <linearGradient id="colorShipments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#86c517" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#86c517" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(134, 197, 23, 0.1)" />
                  <XAxis dataKey="date" stroke="#86c517" />
                  <YAxis stroke="#86c517" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(134, 197, 23, 0.2)",
                      borderRadius: "12px",
                      boxShadow: "0 8px 32px rgba(134, 197, 23, 0.15)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="shipments"
                    stroke="#86c517"
                    fillOpacity={1}
                    fill="url(#colorShipments)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Fade>
        </Grid>

        {/* Contact Analytics */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={1200}>
            <ChartContainer>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar sx={{ background: "linear-gradient(135deg, #68a80d 0%, #5c950b 100%)" }}>
                  <ContactMail />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#2d3748" }}>
                    Contact Inquiries
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monitor customer engagement
                  </Typography>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={contactData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(134, 197, 23, 0.1)" />
                  <XAxis dataKey="date" stroke="#86c517" />
                  <YAxis stroke="#86c517" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(134, 197, 23, 0.2)",
                      borderRadius: "12px",
                      boxShadow: "0 8px 32px rgba(134, 197, 23, 0.15)",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#86c517" name="Total" strokeWidth={3} />
                  <Line type="monotone" dataKey="read" stroke="#68a80d" name="Read" strokeWidth={3} />
                  <Line type="monotone" dataKey="unread" stroke="#b8e034" name="Unread" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Fade>
        </Grid>

        {/* Blog Performance */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={1400}>
            <ChartContainer>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar sx={{ background: "linear-gradient(135deg, #9ed320 0%, #7bb518 100%)" }}>
                  <Article />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#2d3748" }}>
                    Blog Performance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Content engagement metrics
                  </Typography>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={blogData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(134, 197, 23, 0.1)" />
                  <XAxis dataKey="date" stroke="#86c517" />
                  <YAxis stroke="#86c517" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(134, 197, 23, 0.2)",
                      borderRadius: "12px",
                      boxShadow: "0 8px 32px rgba(134, 197, 23, 0.15)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="views" fill="#86c517" name="Views" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="likes" fill="#68a80d" name="Likes" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Fade>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={1600}>
            <ChartContainer>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar sx={{ background: "linear-gradient(135deg, #b8e034 0%, #9ed320 100%)" }}>
                  <Speed />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#2d3748" }}>
                    Content by Category
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Distribution of content types
                  </Typography>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(134, 197, 23, 0.2)",
                      borderRadius: "12px",
                      boxShadow: "0 8px 32px rgba(134, 197, 23, 0.15)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Fade>
        </Grid>

        {/* Top Destinations */}
        {geoData.length > 0 && (
          <Grid item xs={12}>
            <Fade in timeout={1800}>
              <ChartContainer>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Avatar sx={{ background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)" }}>
                    <Timeline />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#2d3748" }}>
                      Top Shipment Destinations
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Most popular shipping locations
                    </Typography>
                  </Box>
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={geoData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(134, 197, 23, 0.1)" />
                    <XAxis type="number" stroke="#86c517" />
                    <YAxis dataKey="destination" type="category" width={150} stroke="#86c517" />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid rgba(134, 197, 23, 0.2)",
                        borderRadius: "12px",
                        boxShadow: "0 8px 32px rgba(134, 197, 23, 0.15)",
                      }}
                    />
                    <Bar dataKey="count" fill="#86c517" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Fade>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default DashboardAnalytics
