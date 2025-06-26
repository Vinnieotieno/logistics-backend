"use client"

import React from "react"

import { useState, useEffect } from "react"
import axios from "axios"
import { QrReader } from "react-qr-reader"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import "jspdf-autotable"
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  Avatar,
  LinearProgress,
  Tooltip,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  Fade,
  Slide,
  Zoom,
  FormControl,
  InputLabel,
  Pagination,
  Divider,
} from "@mui/material"
import {
  Search,
  LocalShipping,
  QrCode2,
  Timeline,
  Map,
  Print,
  Add,
  Edit,
  Close,
  TrendingUp,
  LocationOn,
  Schedule,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import debounce from 'lodash.debounce'

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

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: "24px",
  background: "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(134, 197, 23, 0.1)",
  boxShadow: "0 8px 32px rgba(134, 197, 23, 0.08)",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
}))

const FilterCard = styled(Paper)(({ theme }) => ({
  borderRadius: "20px",
  background: "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(134, 197, 23, 0.1)",
  boxShadow: "0 8px 32px rgba(134, 197, 23, 0.08)",
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}))

const ModernTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: "20px",
  background: "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(134, 197, 23, 0.1)",
  boxShadow: "0 8px 32px rgba(134, 197, 23, 0.08)",
  overflow: "hidden",
}))

const ModernTableRow = styled(TableRow)(({ theme, selected }) => ({
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "rgba(134, 197, 23, 0.05)",
    transform: "translateX(4px)",
  },
  ...(selected && {
    background: "rgba(134, 197, 23, 0.1)",
    "&:hover": {
      background: "rgba(134, 197, 23, 0.15)",
    },
  }),
}))

const StatusChip = styled(Chip)(({ theme, status }) => {
  const statusColors = {
    pending: { bg: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)", color: "white" },
    "picked-up": { bg: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)", color: "white" },
    "in-transit": { bg: "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)", color: "white" },
    "arrived-at-hub": { bg: "linear-gradient(135deg, #673ab7 0%, #512da8 100%)", color: "white" },
    "out-for-delivery": { bg: "linear-gradient(135deg, #fbc02d 0%, #f57f17 100%)", color: "white" },
    delivered: { bg: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)", color: "white" },
    delayed: { bg: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)", color: "white" },
    exception: { bg: "linear-gradient(135deg, #e91e63 0%, #c2185b 100%)", color: "white" },
    returned: { bg: "linear-gradient(135deg, #795548 0%, #5d4037 100%)", color: "white" },
  }
  const style = statusColors[status] || { bg: "#f5f5f5", color: "#666" }
  return {
    background: style.bg,
    color: style.color,
    fontWeight: 600,
    textTransform: "capitalize",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(134, 197, 23, 0.2)",
  }
})

const ModernTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.9)",
      boxShadow: "0 4px 20px rgba(134, 197, 23, 0.1)",
    },
    "&.Mui-focused": {
      background: "white",
      boxShadow: "0 4px 20px rgba(134, 197, 23, 0.2)",
    },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#86c517",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#86c517",
    borderWidth: 2,
  },
}))

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
  borderRadius: "16px",
  padding: theme.spacing(1.5, 3),
  textTransform: "none",
  fontWeight: 600,
  boxShadow: "0 8px 20px rgba(134, 197, 23, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 12px 30px rgba(134, 197, 23, 0.4)",
    background: "linear-gradient(135deg, #7ab515 0%, #5c950b 100%)",
  },
  "&:disabled": {
    background: "linear-gradient(135deg, #ccc 0%, #999 100%)",
    boxShadow: "none",
    transform: "none",
  },
}))

const StatsCard = styled(Paper)(({ theme }) => ({
  borderRadius: "20px",
  background: "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(134, 197, 23, 0.1)",
  boxShadow: "0 8px 32px rgba(134, 197, 23, 0.08)",
  padding: theme.spacing(3),
  textAlign: "center",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 15px 35px rgba(134, 197, 23, 0.15)",
  },
}))

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "picked-up", label: "Picked Up" },
  { value: "in-transit", label: "In Transit" },
  { value: "arrived-at-hub", label: "Arrived at Hub" },
  { value: "out-for-delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "delayed", label: "Delayed" },
  { value: "exception", label: "Exception" },
  { value: "returned", label: "Returned" },
]

const Tracking = () => {
  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSetSearchTerm = React.useMemo(() => debounce(setSearchTerm, 300), [])
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeCount, setActiveCount] = useState(0)
  const [error, setError] = useState("")
  const [trackingSteps, setTrackingSteps] = useState([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 })
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFrom, setDateFrom] = useState(null)
  const [dateTo, setDateTo] = useState(null)
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openTrackUpdate, setOpenTrackUpdate] = useState(false)
  const [openQR, setOpenQR] = useState(false)
  const [qrResult, setQrResult] = useState("")
  const [formData, setFormData] = useState({})
  const [createNote, setCreateNote] = useState("")
  const [trackUpdateData, setTrackUpdateData] = useState({ status: "", location: "", description: "" })
  const [createLoading, setCreateLoading] = useState(false)

  // Backend API base URL
  const API_BASE = process.env.REACT_APP_API_URL || "http://globeflight.co.ke/api"

  // Fetch shipments list
  const fetchShipments = React.useCallback(
    async (params = {}) => {
      setLoading(true)
      setError("")
      try {
        const res = await axios.get(`${API_BASE}/tracking`, {
          params: {
            search: searchTerm,
            page,
            limit: pagination.limit,
            status: statusFilter || undefined,
            dateFrom: dateFrom ? dateFrom.toISOString().slice(0, 10) : undefined,
            dateTo: dateTo ? dateTo.toISOString().slice(0, 10) : undefined,
            ...params,
          },
          headers: {
            // Authorization: `Bearer ${token}`
          },
        })
        setPagination(res.data.data.pagination)
        setActiveCount(res.data.data.shipments.filter((s) => s.status !== "delivered").length)
        setShipments(res.data.data.shipments)
      } catch (err) {
        setError("Failed to fetch shipments")
      }
      setLoading(false)
    },
    [API_BASE, searchTerm, page, pagination.limit, statusFilter, dateFrom, dateTo],
  )

  // Fetch shipment details and tracking steps
  const fetchShipmentDetails = async (shipment) => {
    setLoading(true)
    setError("")
    try {
      const res = await axios.get(`${API_BASE}/tracking/${shipment.id}`, {
        headers: {
          // Authorization: `Bearer ${token}`
        },
      })
      setSelectedShipment(res.data.data)
      const updates = (res.data.data.updates || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      setTrackingSteps(
        updates.map((u) => ({
          label: u.status.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          date: new Date(u.createdAt).toLocaleString(),
          description: u.description,
          location: u.location || "N/A",
        })),
      )
    } catch (err) {
      setError("Failed to fetch shipment details")
    }
    setLoading(false)
  }

  // Initial fetch
  useEffect(() => {
    fetchShipments()
  }, [fetchShipments])

  // Search handler
  const handleSearchInput = (e) => {
    setSearchInput(e.target.value)
    debouncedSetSearchTerm(e.target.value)
    setPage(1)
  }

  // Fetch on search term change (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchShipments()
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchTerm, fetchShipments])

  // Table row click handler
  const handleRowClick = React.useCallback((shipment) => {
    fetchShipmentDetails(shipment)
  }, [fetchShipmentDetails])

  // Active shipments count (from backend stats)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE}/tracking/stats`, {
          headers: {
            // Authorization: `Bearer ${token}`
          },
        })
        setActiveCount(res.data.data.shipments.pending + res.data.data.shipments.inTransit)
      } catch {
        // fallback: do nothing
      }
    }
    fetchStats()
  }, [])

  // --- Create Shipment ---
  const handleCreateShipment = async () => {
    setCreateLoading(true)
    try {
      await axios.post(
        `${API_BASE}/tracking`,
        { ...formData, note: createNote },
        {
          headers: {
            // Authorization: `Bearer ${token}`
          },
        },
      )
      setOpenCreate(false)
      setCreateNote("")
      fetchShipments()
    } catch (err) {
      setError("Failed to create shipment")
    }
    setCreateLoading(false)
  }

  // --- Update Shipment ---
  const handleUpdateShipment = async () => {
    try {
      await axios.put(`${API_BASE}/tracking/${selectedShipment.id}`, formData, {
        headers: {
          // Authorization: `Bearer ${token}`
        },
      })
      setOpenUpdate(false)
      fetchShipments()
    } catch (err) {
      setError("Failed to update shipment")
    }
  }

  // --- Add Tracking Update ---
  const handleAddTrackingUpdate = async () => {
    try {
      await axios.post(`${API_BASE}/tracking/${selectedShipment.id}/updates`, trackUpdateData, {
        headers: {
          // Authorization: `Bearer ${token}`
        },
      })
      setOpenTrackUpdate(false)
      fetchShipmentDetails(selectedShipment)
      fetchShipments()
    } catch (err) {
      setError("Failed to add tracking update")
    }
  }

  // --- QR Code Scan ---
  const handleScan = (data) => {
    if (data) {
      setQrResult(data)
      setSearchTerm(data)
      setOpenQR(false)
    }
  }

  const handleError = (err) => {
    setError("QR Scan Error")
  }

  // --- Print/Export Waybill/Invoice ---
  const handlePrint = async (type) => {
    if (!selectedShipment) return;
    try {
      const res = await fetch(
        `${API_BASE}/tracking/${selectedShipment.id}/${type}`,
        { method: 'GET', credentials: 'include' }
      );
      if (!res.ok) throw new Error('Failed to download');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${selectedShipment.trackingNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to download ${type}`);
    }
  }

  // Helper to validate dimensions format (e.g., "100x50x30")
  const isValidDimensions = (dim) => {
    if (!dim) return true
    return /^\d+(\.\d+)?x\d+(\.\d+)?x\d+(\.\d+)?$/.test(dim.replace(/\s/g, ""))
  }

  // Helper to calculate CBM from dimensions string
  const calculateCBM = (dim) => {
    if (!isValidDimensions(dim)) return ""
    if (!dim) return ""
    const [l, w, h] = dim.replace(/\s/g, "").split("x").map(Number)
    if ([l, w, h].some(isNaN)) return ""
    const factor = l > 10 || w > 10 || h > 10 ? 1000000 : 1
    return ((l * w * h) / factor).toFixed(4)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle sx={{ color: "#86c517" }} />
      case "delayed":
      case "exception":
        return <ErrorIcon sx={{ color: "#f44336" }} />
      case "pending":
        return <Schedule sx={{ color: "#ff9800" }} />
      default:
        return <LocalShipping sx={{ color: "#2196f3" }} />
    }
  }

  const getProgressValue = (shipment) => {
    if (shipment.status === "delivered") return 100
    if (shipment.updates && shipment.updates.length) return Math.min(90, shipment.updates.length * 25)
    return 10
  }

  // Helper to get the latest update with coordinates
  const latestUpdateWithLocation = selectedShipment?.updates
    ? [...selectedShipment.updates].reverse().find(u => u.latitude && u.longitude)
    : null;

  // Memoize ModernTableRow to avoid unnecessary re-renders
  const MemoModernTableRow = React.memo(ModernTableRow);

  // Memoize shipments list rendering
  const renderedShipments = React.useMemo(() => (
    shipments.map((shipment, index) => (
      <Fade in timeout={300 + index * 100} key={shipment.id}>
        <MemoModernTableRow
          hover
          onClick={() => handleRowClick(shipment)}
          selected={selectedShipment && selectedShipment.id === shipment.id}
        >
          <TableCell>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
                  width: 40,
                  height: 40,
                }}
              >
                {getStatusIcon(shipment.status)}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="700" sx={{ color: "#2d3748" }}>
                  {shipment.trackingNumber}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {shipment.serviceType || "Standard"}
                </Typography>
              </Box>
            </Box>
          </TableCell>
          <TableCell>
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <LocationOn fontSize="small" sx={{ color: "#86c517" }} />
                <Typography variant="body2" fontWeight={600}>
                  {shipment.origin} → {shipment.destination}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {shipment.senderName} → {shipment.receiverName}
              </Typography>
            </Box>
          </TableCell>
          <TableCell>
            <StatusChip
              label={shipment.status.replace("-", " ")}
              status={shipment.status}
              size="small"
            />
          </TableCell>
          <TableCell>
            <Box sx={{ width: 120 }}>
              <LinearProgress
                variant="determinate"
                value={getProgressValue(shipment)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  background: "rgba(134, 197, 23, 0.1)",
                  "& .MuiLinearProgress-bar": {
                    background: "linear-gradient(90deg, #86c517 0%, #68a80d 100%)",
                    borderRadius: 4,
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {getProgressValue(shipment)}% Complete
              </Typography>
            </Box>
          </TableCell>
          <TableCell>
            <Box display="flex" gap={0.5}>
              <Tooltip title="View Timeline">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRowClick(shipment)
                  }}
                  sx={{
                    background: "rgba(134, 197, 23, 0.1)",
                    "&:hover": { background: "rgba(134, 197, 23, 0.2)" },
                  }}
                >
                  <Timeline sx={{ color: "#86c517" }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="View Map">
                <IconButton
                  size="small"
                  disabled
                  sx={{
                    background: "rgba(134, 197, 23, 0.1)",
                    "&:hover": { background: "rgba(134, 197, 23, 0.2)" },
                  }}
                >
                  <Map sx={{ color: "#86c517" }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Print">
                <IconButton
                  size="small"
                  disabled
                  sx={{
                    background: "rgba(134, 197, 23, 0.1)",
                    "&:hover": { background: "rgba(134, 197, 23, 0.2)" },
                  }}
                >
                  <Print sx={{ color: "#86c517" }} />
                </IconButton>
              </Tooltip>
            </Box>
          </TableCell>
        </MemoModernTableRow>
      </Fade>
    ))
  ), [shipments, selectedShipment, handleRowClick])

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [debouncedSetSearchTerm]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ModernContainer maxWidth="xl">
        <Box sx={{ position: "relative", zIndex: 1 }}>
          {/* Header Section */}
          <Fade in timeout={800}>
            <HeaderSection>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box display="flex" alignItems="center" gap={2} position="relative" zIndex={1}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        background: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <LocalShipping sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h3" fontWeight="800" gutterBottom sx={{ mb: 1 }}>
                        Shipment Tracking
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                        Monitor and manage all shipments in real-time
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box display="flex" justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                    <StatsCard
                      sx={{
                        background: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        color: "white",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ background: "rgba(255, 255, 255, 0.2)" }}>
                          <TrendingUp />
                        </Avatar>
                        <Box textAlign="left">
                          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>
                            Active Shipments
                          </Typography>
                          <Typography variant="h4" fontWeight="800">
                            {activeCount}
                          </Typography>
                        </Box>
                      </Box>
                    </StatsCard>
                  </Box>
                </Grid>
              </Grid>
            </HeaderSection>
          </Fade>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              {/* Filters Section */}
              <Slide direction="up" in timeout={1000}>
                <FilterCard>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Avatar sx={{ background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)" }}>
                      <Search />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#2d3748" }}>
                        Search & Filter
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Find shipments quickly with advanced filters
                      </Typography>
                    </Box>
                  </Box>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <ModernTextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search by tracking number, sender, or receiver..."
                        value={searchInput}
                        onChange={handleSearchInput}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search sx={{ color: "#86c517" }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={statusFilter}
                          onChange={(e) => {
                            setStatusFilter(e.target.value)
                            setPage(1)
                          }}
                          displayEmpty
                          sx={{ borderRadius: "16px" }}
                        >
                          <MenuItem value="">All Statuses</MenuItem>
                          {STATUS_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <DatePicker
                        label="From"
                        value={dateFrom}
                        onChange={(val) => {
                          setDateFrom(val)
                          setPage(1)
                        }}
                        slotProps={{ textField: { size: "small", fullWidth: true } }}
                      />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <DatePicker
                        label="To"
                        value={dateTo}
                        onChange={(val) => {
                          setDateTo(val)
                          setPage(1)
                        }}
                        slotProps={{ textField: { size: "small", fullWidth: true } }}
                      />
                    </Grid>
                    <Grid item xs={6} md={1}>
                      <GradientButton
                        fullWidth
                        startIcon={<QrCode2 />}
                        onClick={() => setOpenQR(true)}
                        sx={{ minHeight: "56px" }}
                      >
                        QR
                      </GradientButton>
                    </Grid>
                    <Grid item xs={6} md={1}>
                      <GradientButton
                        fullWidth
                        startIcon={<Add />}
                        onClick={() => {
                          setFormData({})
                          setOpenCreate(true)
                        }}
                        sx={{ minHeight: "56px" }}
                      >
                        New
                      </GradientButton>
                    </Grid>
                  </Grid>
                </FilterCard>
              </Slide>

              {/* Error Display */}
              {error && (
                <Fade in>
                  <Box mb={2}>
                    <Paper
                      sx={{
                        p: 2,
                        background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
                        border: "1px solid #f44336",
                        borderRadius: "16px",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <ErrorIcon sx={{ color: "#f44336" }} />
                        <Typography color="error" fontWeight={600}>
                          {error}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                </Fade>
              )}

              {/* Shipments Table */}
              <Zoom in timeout={1200}>
                <ModernTableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{
                          background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
                          "& .MuiTableCell-head": {
                            color: "white",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                          },
                        }}
                      >
                        <TableCell>Tracking Details</TableCell>
                        <TableCell>Route Information</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Progress</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                              <Box sx={{ width: "100%", maxWidth: 400 }}>
                                <LinearProgress
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    background: "rgba(134, 197, 23, 0.1)",
                                    "& .MuiLinearProgress-bar": {
                                      background: "linear-gradient(90deg, #86c517 0%, #68a80d 100%)",
                                    },
                                  }}
                                />
                                <Typography align="center" sx={{ mt: 2, color: "#86c517", fontWeight: 600 }}>
                                  Loading shipments...
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : shipments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Box py={4}>
                              <Avatar
                                sx={{
                                  width: 64,
                                  height: 64,
                                  background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
                                  margin: "0 auto 16px",
                                }}
                              >
                                <LocalShipping sx={{ fontSize: 32 }} />
                              </Avatar>
                              <Typography variant="h6" color="text.secondary" gutterBottom>
                                No shipments found
                              </Typography>
                              <Typography color="text.secondary">
                                Try adjusting your search criteria or create a new shipment
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        renderedShipments
                      )}
                    </TableBody>
                  </Table>
                </ModernTableContainer>
              </Zoom>

              {/* Pagination */}
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={pagination.pages}
                  page={pagination.page}
                  onChange={(e, value) => setPage(value)}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: "12px",
                      fontWeight: 600,
                      "&.Mui-selected": {
                        background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
                        color: "white",
                      },
                    },
                  }}
                  disabled={loading || pagination.pages < 2}
                />
              </Box>
            </Grid>

            {/* Tracking Details Sidebar */}
            <Grid item xs={12} lg={4}>
              {selectedShipment && (
                <Slide direction="left" in timeout={1400}>
                  <ModernCard>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <Avatar sx={{ background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)" }}>
                          <Timeline />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#2d3748" }}>
                            Tracking Timeline
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedShipment.trackingNumber}
                          </Typography>
                        </Box>
                      </Box>

                      <Stepper orientation="vertical" activeStep={trackingSteps.length - 1}>
                        {trackingSteps.map((step, index) => (
                          <Step key={index} completed={index < trackingSteps.length - 1}>
                            <StepLabel
                              StepIconComponent={() => (
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    background:
                                      index === trackingSteps.length - 1
                                        ? "linear-gradient(135deg, #86c517 0%, #68a80d 100%)"
                                        : "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  {index + 1}
                                </Avatar>
                              )}
                            >
                              <Box ml={2}>
                                <Typography variant="body1" fontWeight="600" sx={{ color: "#2d3748" }}>
                                  {step.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {step.date}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  📍 {step.location}
                                </Typography>
                                {step.description && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {step.description}
                                  </Typography>
                                )}
                              </Box>
                            </StepLabel>
                          </Step>
                        ))}
                      </Stepper>

                      {/* Map for latest tracking update */}
                      {selectedShipment && latestUpdateWithLocation && (
                        <Box mt={3} mb={3} sx={{ height: 250, borderRadius: 2, overflow: "hidden" }}>
                          <MapContainer
                            center={[latestUpdateWithLocation.latitude, latestUpdateWithLocation.longitude]}
                            zoom={13}
                            style={{ height: "100%", width: "100%" }}
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[latestUpdateWithLocation.latitude, latestUpdateWithLocation.longitude]}>
                              <Popup>
                                {latestUpdateWithLocation.status} <br />
                                {latestUpdateWithLocation.location}
                              </Popup>
                            </Marker>
                          </MapContainer>
                        </Box>
                      )}

                      <Divider sx={{ my: 3 }} />

                      {/* Action Buttons */}
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <GradientButton
                            fullWidth
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => {
                              setFormData(selectedShipment)
                              setOpenUpdate(true)
                            }}
                          >
                            Edit
                          </GradientButton>
                        </Grid>
                        <Grid item xs={6}>
                          <GradientButton
                            fullWidth
                            size="small"
                            startIcon={<Add />}
                            onClick={() => setOpenTrackUpdate(true)}
                          >
                            Update
                          </GradientButton>
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            startIcon={<Print />}
                            onClick={() => handlePrint("waybill")}
                            sx={{
                              borderColor: "#86c517",
                              color: "#86c517",
                              borderRadius: "12px",
                              "&:hover": {
                                borderColor: "#68a80d",
                                background: "rgba(134, 197, 23, 0.05)",
                              },
                            }}
                          >
                            Waybill
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            startIcon={<Print />}
                            onClick={() => handlePrint("invoice")}
                            sx={{
                              borderColor: "#86c517",
                              color: "#86c517",
                              borderRadius: "12px",
                              "&:hover": {
                                borderColor: "#68a80d",
                                background: "rgba(134, 197, 23, 0.05)",
                              },
                            }}
                          >
                            Invoice
                          </Button>
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 3 }} />

                      {/* Shipment Details */}
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#86c517", mb: 2 }}>
                          Shipment Details
                        </Typography>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            CBM:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {selectedShipment.cbm
                              ? Number(selectedShipment.cbm).toFixed(4)
                              : calculateCBM(selectedShipment.dimensions)}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            Package Name:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {selectedShipment.packageName || "-"}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            Packages:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {selectedShipment.numberOfPackages || "-"}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            Dangerous Good:
                          </Typography>
                          <Chip
                            label={selectedShipment.isDangerousGood ? "Yes" : "No"}
                            size="small"
                            sx={{
                              background: selectedShipment.isDangerousGood
                                ? "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)"
                                : "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
                              color: "white",
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                        {selectedShipment.isDangerousGood && (
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" color="text.secondary">
                              UN Number:
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {selectedShipment.unNumber || "-"}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Policy Section */}
                      <Box
                        mt={3}
                        p={2}
                        sx={{
                          background: "rgba(134, 197, 23, 0.05)",
                          borderRadius: "12px",
                          border: "1px solid rgba(134, 197, 23, 0.1)",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          <strong>Policy:</strong> All shipments are subject to company policy. Please check our website
                          for full terms and conditions.
                        </Typography>
                      </Box>

                      {/* Timestamps */}
                      <Box mt={2}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Created:{" "}
                          {selectedShipment?.createdAt ? new Date(selectedShipment.createdAt).toLocaleString() : ""}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Last Updated:{" "}
                          {selectedShipment?.updatedAt ? new Date(selectedShipment.updatedAt).toLocaleString() : ""}
                        </Typography>
                      </Box>
                    </CardContent>
                  </ModernCard>
                </Slide>
              )}
            </Grid>
          </Grid>
        </Box>

        {/* Create Shipment Modal */}
        <Dialog
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          maxWidth="md"
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
                Create New Shipment
              </Typography>
              <IconButton onClick={() => setOpenCreate(false)} sx={{ color: "text.secondary" }}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <ModernTextField
                  label="Sender Name"
                  fullWidth
                  required
                  value={formData.senderName || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, senderName: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ModernTextField
                  label="Sender Email"
                  fullWidth
                  value={formData.senderEmail || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, senderEmail: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ModernTextField
                  label="Sender Phone"
                  fullWidth
                  value={formData.senderPhone || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, senderPhone: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ModernTextField
                  label="Sender Address"
                  fullWidth
                  value={formData.senderAddress || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, senderAddress: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ModernTextField
                  label="Receiver Name"
                  fullWidth
                  required
                  value={formData.receiverName || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, receiverName: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ModernTextField
                  label="Receiver Email"
                  fullWidth
                  value={formData.receiverEmail || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, receiverEmail: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ModernTextField
                  label="Receiver Phone"
                  fullWidth
                  value={formData.receiverPhone || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, receiverPhone: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ModernTextField
                  label="Receiver Address"
                  fullWidth
                  value={formData.receiverAddress || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, receiverAddress: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <ModernTextField
                  label="Package Description"
                  fullWidth
                  value={formData.packageDescription || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, packageDescription: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <ModernTextField
                  label="Weight (kg)"
                  type="number"
                  fullWidth
                  value={formData.weight || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, weight: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <ModernTextField
                  label="Dimensions (LxWxH)"
                  fullWidth
                  value={formData.dimensions || ""}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData((f) => ({
                      ...f,
                      dimensions: value,
                      cbm: calculateCBM(value),
                    }))
                  }}
                  error={!!formData.dimensions && !isValidDimensions(formData.dimensions)}
                  helperText={
                    formData.dimensions && !isValidDimensions(formData.dimensions)
                      ? "Invalid format. Use LxWxH, e.g. 100x50x30"
                      : ""
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <ModernTextField
                  label="CBM (calculated)"
                  fullWidth
                  value={calculateCBM(formData.dimensions)}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ModernTextField
                  label="Declared Value"
                  type="number"
                  fullWidth
                  value={formData.declaredValue || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, declaredValue: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel></InputLabel>
                  <Select
                    value={formData.mode || ""}
                    onChange={(e) => setFormData((f) => ({ ...f, mode: e.target.value }))}
                    displayEmpty
                    sx={{ borderRadius: "16px" }}
                  >
                    <MenuItem value="">Select Mode</MenuItem>
                    <MenuItem value="courier">Courier</MenuItem>
                    <MenuItem value="air">Air Freight</MenuItem>
                    <MenuItem value="sea">Sea Freight</MenuItem>
                    <MenuItem value="land">Land</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <ModernTextField
                  label="Service Type"
                  fullWidth
                  value={formData.serviceType || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, serviceType: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ModernTextField
                  label="Origin"
                  fullWidth
                  required
                  value={formData.origin || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, origin: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ModernTextField
                  label="Destination"
                  fullWidth
                  required
                  value={formData.destination || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, destination: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ModernTextField
                  label="Package Name"
                  fullWidth
                  value={formData.packageName || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, packageName: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <ModernTextField
                  label="Number of Packages"
                  type="number"
                  fullWidth
                  value={formData.numberOfPackages || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, numberOfPackages: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Dangerous Good?</InputLabel>
                  <Select
                    value={formData.isDangerousGood === true ? "yes" : formData.isDangerousGood === false ? "no" : ""}
                    onChange={(e) => setFormData((f) => ({ ...f, isDangerousGood: e.target.value === "yes" }))}
                    displayEmpty
                    sx={{ borderRadius: "16px" }}
                  >
                    <MenuItem value=""></MenuItem>
                    <MenuItem value="yes">Yes</MenuItem>
                    <MenuItem value="no">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <ModernTextField
                  label="UN Number"
                  fullWidth
                  value={formData.unNumber || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, unNumber: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <ModernTextField
                  label="Note"
                  fullWidth
                  required
                  multiline
                  rows={3}
                  value={createNote}
                  onChange={(e) => setCreateNote(e.target.value)}
                  helperText="Please leave a note for this shipment (required, minimum 5 characters)"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenCreate(false)} sx={{ borderRadius: "12px" }}>
              Cancel
            </Button>
            <GradientButton
              onClick={handleCreateShipment}
              disabled={
                createLoading ||
                !formData.senderName ||
                !formData.receiverName ||
                !formData.origin ||
                !formData.destination ||
                (formData.dimensions && !isValidDimensions(formData.dimensions)) ||
                !createNote ||
                createNote.length < 5
              }
            >
              {createLoading ? "Creating..." : "Create Shipment"}
            </GradientButton>
          </DialogActions>
        </Dialog>

        {/* Update Shipment Modal */}
        <Dialog
          open={openUpdate}
          onClose={() => setOpenUpdate(false)}
          maxWidth="md"
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
                Update Shipment
              </Typography>
              <IconButton onClick={() => setOpenUpdate(false)} sx={{ color: "text.secondary" }}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel></InputLabel>
                  <Select
                    value={formData.status || ""}
                    onChange={(e) => setFormData((f) => ({ ...f, status: e.target.value }))}
                    displayEmpty
                    sx={{ borderRadius: "16px" }}
                  >
                    <MenuItem value="">Select Status</MenuItem>
                    {STATUS_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Add similar fields as create modal */}
              <Grid item xs={12} md={6}>
                <ModernTextField
                  label="Sender Name"
                  fullWidth
                  value={formData.senderName || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, senderName: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ModernTextField
                  label="Receiver Name"
                  fullWidth
                  value={formData.receiverName || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, receiverName: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ModernTextField
                  label="Origin"
                  fullWidth
                  value={formData.origin || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, origin: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ModernTextField
                  label="Destination"
                  fullWidth
                  value={formData.destination || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, destination: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenUpdate(false)} sx={{ borderRadius: "12px" }}>
              Cancel
            </Button>
            <GradientButton onClick={handleUpdateShipment}>Update Shipment</GradientButton>
          </DialogActions>
        </Dialog>

        {/* Add Tracking Update Modal */}
        <Dialog
          open={openTrackUpdate}
          onClose={() => setOpenTrackUpdate(false)}
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
                Add Tracking Update
              </Typography>
              <IconButton onClick={() => setOpenTrackUpdate(false)} sx={{ color: "text.secondary" }}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel></InputLabel>
                  <Select
                    value={trackUpdateData.status || ""}
                    onChange={(e) => setTrackUpdateData((f) => ({ ...f, status: e.target.value }))}
                    displayEmpty
                    sx={{ borderRadius: "16px" }}
                  >
                    <MenuItem value="">Select Status</MenuItem>
                    {STATUS_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <ModernTextField
                  label="Location"
                  fullWidth
                  value={trackUpdateData.location}
                  onChange={(e) => setTrackUpdateData((f) => ({ ...f, location: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <ModernTextField
                  label="Note"
                  fullWidth
                  required
                  multiline
                  rows={3}
                  value={trackUpdateData.description}
                  onChange={(e) => setTrackUpdateData((f) => ({ ...f, description: e.target.value }))}
                  helperText="Please leave a note for this update (required, minimum 5 characters)"
                />
              </Grid>
              <Grid item xs={12}>
                <ModernTextField
                  label="Latitude (optional)"
                  fullWidth
                  type="number"
                  value={trackUpdateData.latitude || ""}
                  onChange={(e) => setTrackUpdateData((f) => ({ ...f, latitude: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <ModernTextField
                  label="Longitude (optional)"
                  fullWidth
                  type="number"
                  value={trackUpdateData.longitude || ""}
                  onChange={(e) => setTrackUpdateData((f) => ({ ...f, longitude: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenTrackUpdate(false)} sx={{ borderRadius: "12px" }}>
              Cancel
            </Button>
            <GradientButton
              onClick={handleAddTrackingUpdate}
              disabled={
                !trackUpdateData.status || !trackUpdateData.description || trackUpdateData.description.length < 5
              }
            >
              Add Update
            </GradientButton>
          </DialogActions>
        </Dialog>

        {/* QR Code Scanner Modal */}
        <Dialog
          open={openQR}
          onClose={() => setOpenQR(false)}
          maxWidth="xs"
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
                Scan QR Code
              </Typography>
              <IconButton onClick={() => setOpenQR(false)} sx={{ color: "text.secondary" }}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: "center", py: 2 }}>
              <QrReader
                onResult={(result, error) => {
                  if (!!result) {
                    setQrResult(result?.text || "")
                    setSearchTerm(result?.text || "")
                    setOpenQR(false)
                  }
                  if (!!error) {
                    setError("QR Scan Error")
                  }
                }}
                constraints={{ facingMode: "environment" }}
                style={{ width: "100%" }}
              />
              {qrResult && (
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Scanned Result:
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ color: "#86c517" }}>
                    {qrResult}
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <GradientButton onClick={() => setOpenQR(false)} fullWidth>
              Close Scanner
            </GradientButton>
          </DialogActions>
        </Dialog>
      </ModernContainer>
    </LocalizationProvider>
  )
}

export default Tracking
