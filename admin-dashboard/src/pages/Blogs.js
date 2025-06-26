"use client"

// src/pages/Blogs.js
import { useState, useEffect } from "react"
import axios from "axios"
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  LinearProgress,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  Container,
  Fade,
  Slide,
  Zoom,
} from "@mui/material"
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  TrendingUp,
  Schedule,
  Person,
  LocalOffer,
  ThumbUp,
  Comment,
  BookmarkBorder,
  Public,
  Article,
  Star,
} from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import { toast } from "react-hot-toast"
import { Editor } from "@tinymce/tinymce-react"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import { Dialog as MuiDialog, DialogTitle as MuiDialogTitle, DialogContent as MuiDialogContent, DialogActions as MuiDialogActions } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const API_URL = process.env.REACT_APP_API_URL || "http://globeflight.co.ke/api"

// Modern Styled Components
const GlassContainer = styled(Container)(({ theme }) => ({
  background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
  backdropFilter: "blur(20px)",
  borderRadius: "24px",
  border: "1px solid rgba(255,255,255,0.1)",
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
}))

const ModernHeader = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
  borderRadius: "32px",
  padding: theme.spacing(6),
  marginBottom: theme.spacing(4),
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

const ModernBlogCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
  backdropFilter: "blur(20px)",
  borderRadius: "24px",
  border: "1px solid rgba(255,255,255,0.2)",
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
    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover": {
    transform: "translateY(-12px) scale(1.02)",
    boxShadow: "0 25px 50px rgba(102, 126, 234, 0.25)",
    "&::before": {
      opacity: 1,
    },
  },
}))

const StatsCard = styled(Paper)(({ theme }) => ({
  background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)",
  backdropFilter: "blur(20px)",
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.2)",
  padding: theme.spacing(3),
  textAlign: "center",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 15px 35px rgba(102, 126, 234, 0.15)",
  },
}))

const ModernTabs = styled(Tabs)(({ theme }) => ({
  background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
  backdropFilter: "blur(20px)",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.2)",
  padding: theme.spacing(1),
  "& .MuiTab-root": {
    textTransform: "none",
    fontWeight: 600,
    borderRadius: "12px",
    margin: theme.spacing(0, 0.5),
    transition: "all 0.3s ease",
    "&.Mui-selected": {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)",
    },
  },
  "& .MuiTabs-indicator": {
    display: "none",
  },
}))

const ModernSearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.2)",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 8px 25px rgba(102, 126, 234, 0.15)",
    },
    "&.Mui-focused": {
      boxShadow: "0 8px 25px rgba(102, 126, 234, 0.25)",
      border: "1px solid rgba(102, 126, 234, 0.3)",
    },
    "& fieldset": {
      border: "none",
    },
  },
}))

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  borderRadius: "16px",
  padding: theme.spacing(1.5, 3),
  textTransform: "none",
  fontWeight: 600,
  boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 12px 30px rgba(102, 126, 234, 0.4)",
    background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
  },
}))

const Blogs = () => {
  const [tabValue, setTabValue] = useState(0)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, limit: 10, total: 0 })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState("create") // 'create' or 'edit'
  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    content: "",
    categoryId: "",
    isPublished: false,
    isFeatured: false,
    tags: [],
  })
  const [categories, setCategories] = useState([])
  const [formLoading, setFormLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Comments management state
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Category management
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [categoryLoading, setCategoryLoading] = useState(false)

  // Reset page to 1 when tab or search changes
  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }))
    // eslint-disable-next-line
  }, [tabValue, search])

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true)
      setError("")
      try {
        const params = {
          search: search || undefined,
          page: pagination.page,
          limit: pagination.limit,
        }
        // Server-side filtering (optional)
        if (tabValue === 1) params.published = true
        if (tabValue === 2) params.published = false
        if (tabValue === 3) params.featured = true

        const res = await axios.get(`${API_URL}/blogs`, { params })
        setBlogs(res.data.data.blogs || [])
        setPagination((prev) => ({
          ...prev,
          ...res.data.data.pagination,
        }))
      } catch (err) {
        setError("Failed to load blogs")
      }
      setLoading(false)
    }
    fetchBlogs()
    // eslint-disable-next-line
  }, [search, tabValue, pagination.page])

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/blogs/stats`)
        const d = res.data.data
        setStats([
          {
            label: "Total Posts",
            value: d.blogs.total,
            icon: <TrendingUp />,
            change: `+${d.blogs.published}`,
            color: "#667eea",
          },
          {
            label: "Total Views",
            value: d.engagement.totalViews,
            icon: <Visibility />,
            change: `+${d.engagement.avgViews}`,
            color: "#764ba2",
          },
          { label: "Total Likes", value: d.engagement.totalLikes, icon: <ThumbUp />, change: "+0", color: "#f093fb" },
          {
            label: "Comments",
            value: d.comments.total,
            icon: <Comment />,
            change: `+${d.comments.pending}`,
            color: "#4facfe",
          },
        ])
      } catch (err) {
        // ignore stats error
      }
    }
    fetchStats()
  }, [])

  // Fetch categories for select and sidebar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/categories`)
        setCategories(res.data.data || [])
      } catch {
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  // Open dialog for create/edit
  const handleOpenDialog = (mode = "create", blog = null) => {
    setDialogMode(mode)
    if (mode === "edit" && blog) {
      setForm({
        title: blog.title || "",
        shortDescription: blog.shortDescription || "",
        content: blog.content || "",
        categoryId: blog.category?.id || "",
        isPublished: blog.isPublished || false,
        isFeatured: blog.isFeatured || false,
        tags: blog.tags || [],
        id: blog.id,
      })
    } else {
      setForm({
        title: "",
        shortDescription: "",
        content: "",
        categoryId: "",
        isPublished: false,
        isFeatured: false,
        tags: [],
      })
    }
    setDialogOpen(true)
  }

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Handle image file change
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0])
  }

  // Handle blog create/edit submit (with image upload)
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (key === "tags") {
          formData.append("tags", Array.isArray(value) ? value.join(",") : value)
        } else {
          formData.append(key, value)
        }
      })
      if (imageFile) {
        formData.append("featuredImage", imageFile)
      }
      if (dialogMode === "create") {
        await axios.post(`${API_URL}/blogs`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        toast.success("Blog created")
      } else {
        await axios.put(`${API_URL}/blogs/${form.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        toast.success("Blog updated")
      }
      setDialogOpen(false)
      setFormLoading(false)
      setImageFile(null)
      setPagination((p) => ({ ...p, page: 1 }))
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving blog")
      setFormLoading(false)
    }
  }

  // Blog details dialog
  const handleViewDetails = (blog) => {
    setSelectedBlog(blog)
    setDetailsOpen(true)
    setAnchorEl(null)
  }

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    setCategoryLoading(true)
    try {
      await axios.post(`${API_URL}/categories`, { name: newCategory })
      toast.success("Category added")
      setNewCategory("")
      setCategoryDialogOpen(false)
      // Refresh categories
      const res = await axios.get(`${API_URL}/categories`)
      setCategories(res.data.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding category")
    }
    setCategoryLoading(false)
  }

  // Handle blog delete
  const handleDelete = async (blog) => {
    if (!window.confirm("Delete this blog?")) return
    try {
      await axios.delete(`${API_URL}/blogs/${blog.id}`)
      toast.success("Blog deleted")
      // Refresh blogs
      setPagination((p) => ({ ...p, page: 1 }))
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting blog")
    }
    setAnchorEl(null)
  }

  // Fetch comments
  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/blogs/comments`);
      setComments(res.data.data.comments || []);
    } catch {
      setComments([]);
    }
    setCommentsLoading(false);
  };

  // Approve/reject comment
  const handleModerateComment = async (id, approved) => {
    try {
      await axios.patch(`${API_URL}/blogs/comments/${id}/moderate`, { approved });
      toast.success(`Comment ${approved ? "approved" : "rejected"}`);
      fetchComments();
    } catch (err) {
      toast.error("Failed to moderate comment");
    }
  };

  // Helper to get publishing progress
  const getPublishingProgress = () => {
    if (!stats.length) return 0
    const total = stats[0]?.value || 0
    const published = stats[0]?.change ? Number.parseInt(stats[0].change.replace("+", "")) : 0
    return total ? Math.round((published / total) * 100) : 0
  }

  // Helper to get tab icons
  const getTabIcon = (index) => {
    switch (index) {
      case 0:
        return <BookmarkBorder sx={{ mr: 1 }} />
      case 1:
        return <Public sx={{ mr: 1 }} />
      case 2:
        return <Article sx={{ mr: 1 }} />
      case 3:
        return <Star sx={{ mr: 1 }} />
      default:
        return null
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(255, 255, 255, 0.2)",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Fade in timeout={800}>
          <ModernHeader>
            <Box display="flex" justifyContent="space-between" alignItems="center" position="relative" zIndex={1}>
              <Box>
                <Typography variant="h3" fontWeight="800" gutterBottom sx={{ color: "white", mb: 2 }}>
                  Blog Management
                </Typography>
                <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 400 }}>
                  Create, manage, and publish your content with style
                </Typography>
              </Box>
              <Box display="flex" gap={2}>
                <GradientButton
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog("create")}
                  sx={{ color: "white" }}
                >
                  New Post
                </GradientButton>
                {/* Add Manage Comments button here, next to Add Post */}
                <GradientButton
                  variant="contained"
                  startIcon={<Comment />}
                  size="medium"
                  sx={{
                    background: "linear-gradient(90deg, #f093fb 0%, #667eea 100%)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "1rem",
                    boxShadow: "0 4px 16px rgba(102, 126, 234, 0.15)",
                    px: 3,
                    py: 1.5,
                    borderRadius: "24px",
                    border: "2px solid #764ba2",
                    "&:hover": {
                      background: "linear-gradient(90deg, #667eea 0%, #f093fb 100%)",
                      color: "#fff",
                      borderColor: "#f093fb",
                      transform: "scale(1.05)",
                    },
                  }}
                  onClick={() => {
                    setCommentsDialogOpen(true);
                    fetchComments();
                  }}
                >
                  Manage Comments
                </GradientButton>
                <GradientButton
                  variant="outlined"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => setCategoryDialogOpen(true)}
                  sx={{
                    color: "white",
                    borderColor: "rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.1)",
                    "&:hover": {
                      background: "rgba(255,255,255,0.2)",
                      borderColor: "rgba(255,255,255,0.5)",
                    },
                  }}
                >
                  Add Category
                </GradientButton>
              </Box>
            </Box>
          </ModernHeader>
        </Fade>

        <Slide direction="up" in timeout={1000}>
          <Box>
            <ModernTabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{ mb: 4 }}
              variant="fullWidth"
            >
              <Tab icon={getTabIcon(0)} label={`All Posts (${stats[0]?.value ?? 0})`} iconPosition="start" />
              <Tab
                icon={getTabIcon(1)}
                label={`Published (${stats[0]?.change ? Number.parseInt(stats[0].change.replace("+", "")) : 0})`}
                iconPosition="start"
              />
              <Tab
                icon={getTabIcon(2)}
                label={`Drafts (${stats[0]?.value && stats[0]?.change ? stats[0].value - Number.parseInt(stats[0].change.replace("+", "")) : 0})`}
                iconPosition="start"
              />
              <Tab
                icon={getTabIcon(3)}
                label={`Featured (${blogs.filter((b) => b.isFeatured).length})`}
                iconPosition="start"
              />
            </ModernTabs>
          </Box>
        </Slide>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Zoom in timeout={1200}>
              <Box>
                <ModernSearchField
                  fullWidth
                  variant="outlined"
                  placeholder="Search your amazing blog posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "#667eea" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 4 }}
                />
              </Box>
            </Zoom>

            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                <Box sx={{ width: "100%", maxWidth: 400 }}>
                  <LinearProgress
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      background: "rgba(255,255,255,0.3)",
                      "& .MuiLinearProgress-bar": {
                        background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                      },
                    }}
                  />
                  <Typography align="center" sx={{ mt: 2, color: "#667eea", fontWeight: 600 }}>
                    Loading your content...
                  </Typography>
                </Box>
              </Box>
            ) : error ? (
              <Typography color="error" align="center" variant="h6">
                {error}
              </Typography>
            ) : blogs.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  No blogs found
                </Typography>
                <Typography color="text.secondary">Start creating amazing content!</Typography>
              </Box>
            ) : (
              <Box>
                {blogs.map((blog, index) => (
                  <Fade in timeout={800 + index * 100} key={blog.id}>
                    <ModernBlogCard sx={{ mb: 3 }}>
                      <CardContent sx={{ p: 4 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="start">
                          <Box flex={1}>
                            <Box display="flex" alignItems="center" gap={1} mb={2} flexWrap="wrap">
                              {blog.isFeatured && (
                                <Chip
                                  label="Featured"
                                  size="small"
                                  sx={{
                                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                                    color: "white",
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                              <Chip
                                label={blog.isPublished ? "Published" : "Draft"}
                                size="small"
                                sx={{
                                  background: blog.isPublished
                                    ? "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                                    : "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                                  color: "white",
                                  fontWeight: 600,
                                }}
                              />
                              {blog.category && (
                                <Chip
                                  label={blog.category.name}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: "#667eea",
                                    color: "#667eea",
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                            </Box>
                            <Typography variant="h5" fontWeight="700" gutterBottom sx={{ color: "#2d3748" }}>
                              {blog.title}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
                              {blog.shortDescription}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <Person fontSize="small" sx={{ color: "#667eea" }} />
                                <Typography variant="body2" fontWeight={500}>
                                  {blog.author?.fullName}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <Schedule fontSize="small" sx={{ color: "#764ba2" }} />
                                <Typography variant="body2">
                                  {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ""}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <Visibility fontSize="small" sx={{ color: "#f093fb" }} />
                                <Typography variant="body2" fontWeight={600}>
                                  {blog.viewsCount}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <ThumbUp fontSize="small" sx={{ color: "#4facfe" }} />
                                <Typography variant="body2" fontWeight={600}>
                                  {blog.likesCount}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <Comment fontSize="small" sx={{ color: "#00f2fe" }} />
                                <Typography variant="body2" fontWeight={600}>
                                  {blog.commentCount || 0}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          <IconButton
                            onClick={(e) => {
                              setAnchorEl(e.currentTarget)
                              setSelectedBlog(blog)
                            }}
                            sx={{
                              background:
                                "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                              "&:hover": {
                                background:
                                  "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)",
                              },
                            }}
                          >
                            <MoreVert sx={{ color: "#667eea" }} />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </ModernBlogCard>
                  </Fade>
                ))}
              </Box>
            )}

            {/* Pagination controls */}
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={(e, value) => setPagination((p) => ({ ...p, page: value }))}
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: "12px",
                    fontWeight: 600,
                    "&.Mui-selected": {
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                    },
                  },
                }}
                disabled={loading || pagination.pages < 2}
              />
            </Box>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Slide direction="left" in timeout={1400}>
              <Box>
                {/* Stats Cards */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {stats.map((stat, index) => (
                    <Grid item xs={6} key={index}>
                      <Zoom in timeout={1000 + index * 200}>
                        <StatsCard>
                          <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                          <Typography variant="h4" fontWeight="800" sx={{ color: "#2d3748" }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            {stat.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: stat.color, fontWeight: 600 }}>
                            {stat.change}
                          </Typography>
                        </StatsCard>
                      </Zoom>
                    </Grid>
                  ))}
                </Grid>

                {/* Publishing Progress */}
                <GlassContainer sx={{ mb: 4 }}>
                  <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: "#2d3748" }}>
                    Publishing Progress
                  </Typography>
                  <Box sx={{ my: 3 }}>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="body2" fontWeight={600}>
                        Content Published
                      </Typography>
                      <Typography variant="body2" fontWeight="800" sx={{ color: "#667eea" }}>
                        {getPublishingProgress()}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={getPublishingProgress()}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        background: "rgba(102, 126, 234, 0.1)",
                        "& .MuiLinearProgress-bar": {
                          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                          borderRadius: 6,
                        },
                      }}
                    />
                  </Box>
                </GlassContainer>

                {/* Categories */}
                <GlassContainer>
                  <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: "#2d3748" }}>
                    Categories
                  </Typography>
                  {categories.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No categories found.
                    </Typography>
                  ) : (
                    categories.map((cat, index) => (
                      <Fade in timeout={1600 + index * 100} key={cat.id}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocalOffer fontSize="small" sx={{ color: "#667eea" }} />
                            <Typography variant="body2" fontWeight={600}>
                              {cat.name}
                            </Typography>
                          </Box>
                        </Box>
                      </Fade>
                    ))
                  )}
                </GlassContainer>
              </Box>
            </Slide>
          </Grid>
        </Grid>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
              backdropFilter: "blur(20px)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.2)",
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setAnchorEl(null)
              handleOpenDialog("edit", selectedBlog)
            }}
          >
            <Edit fontSize="small" sx={{ mr: 1, color: "#667eea" }} /> Edit
          </MenuItem>
          <MenuItem onClick={() => handleViewDetails(selectedBlog)}>
            <Visibility fontSize="small" sx={{ mr: 1, color: "#764ba2" }} /> View
          </MenuItem>
          <MenuItem onClick={() => handleDelete(selectedBlog)} sx={{ color: "error.main" }}>
            <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>

        {/* Blog Create/Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)",
              backdropFilter: "blur(20px)",
              borderRadius: "24px",
              border: "1px solid rgba(255,255,255,0.2)",
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h5" fontWeight="700" sx={{ color: "#2d3748" }}>
              {dialogMode === "create" ? "Create Blog Post" : "Edit Blog Post"}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 2 }}>
              <TextField
                label="Title"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                fullWidth
                required
                sx={{ mb: 3 }}
                InputProps={{
                  sx: {
                    borderRadius: "12px",
                  },
                }}
              />
              <TextField
                label="Short Description"
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleFormChange}
                fullWidth
                multiline
                minRows={3}
                sx={{ mb: 3 }}
                InputProps={{
                  sx: {
                    borderRadius: "12px",
                  },
                }}
              />
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: "#2d3748" }}>
                  Content
                </Typography>
                <Editor
                  apiKey="n6nmqtos4c4w9toulzor0y8qgkfd5e9lvyxvlrr5u66dczfr"
                  init={{
                    plugins: [
                      "anchor",
                      "autolink",
                      "charmap",
                      "codesample",
                      "emoticons",
                      "image",
                      "link",
                      "lists",
                      "media",
                      "searchreplace",
                      "table",
                      "visualblocks",
                      "wordcount",
                      "checklist",
                      "mediaembed",
                      "casechange",
                      "formatpainter",
                      "pageembed",
                      "a11ychecker",
                      "tinymcespellchecker",
                      "permanentpen",
                      "powerpaste",
                      "advtable",
                      "advcode",
                      "editimage",
                      "advtemplate",
                      "ai",
                      "mentions",
                      "tinycomments",
                      "tableofcontents",
                      "footnotes",
                      "mergetags",
                      "autocorrect",
                      "typography",
                      "inlinecss",
                      "markdown",
                      "importword",
                      "exportword",
                      "exportpdf",
                    ],
                    toolbar:
                      "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
                    tinycomments_mode: "embedded",
                    tinycomments_author: "Author name",
                    mergetags_list: [
                      { value: "First.Name", title: "First Name" },
                      { value: "Email", title: "Email" },
                    ],
                    ai_request: (request, respondWith) =>
                      respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
                    height: 300,
                    menubar: false,
                  }}
                  value={form.content}
                  onEditorChange={(content) => setForm((f) => ({ ...f, content }))}
                  initialValue=""
                />
              </Box>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleFormChange}
                  label="Category"
                  sx={{ borderRadius: "12px" }}
                >
                  {categories.length === 0 ? (
                    <MuiMenuItem value="" disabled>
                      No categories available
                    </MuiMenuItem>
                  ) : (
                    categories.map((cat) => (
                      <MuiMenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MuiMenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <TextField
                label="Tags (comma separated)"
                name="tags"
                value={Array.isArray(form.tags) ? form.tags.join(",") : form.tags}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  }))
                }
                fullWidth
                sx={{ mb: 3 }}
                InputProps={{
                  sx: {
                    borderRadius: "12px",
                  },
                }}
              />
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: "#2d3748" }}>
                  Featured Image
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    padding: "12px",
                    borderRadius: "12px",
                    border: "2px dashed #667eea",
                    width: "100%",
                    background: "rgba(102, 126, 234, 0.05)",
                  }}
                />
              </Box>
              <Box display="flex" gap={2}>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel shrink>Published</InputLabel>
                  <Select
                    name="isPublished"
                    value={form.isPublished}
                    onChange={handleFormChange}
                    sx={{ borderRadius: "12px" }}
                  >
                    <MuiMenuItem value={true}>Yes</MuiMenuItem>
                    <MuiMenuItem value={false}>No</MuiMenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel shrink>Featured</InputLabel>
                  <Select
                    name="isFeatured"
                    value={form.isFeatured}
                    onChange={handleFormChange}
                    sx={{ borderRadius: "12px" }}
                  >
                    <MuiMenuItem value={true}>Yes</MuiMenuItem>
                    <MuiMenuItem value={false}>No</MuiMenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setDialogOpen(false)} disabled={formLoading} sx={{ borderRadius: "12px" }}>
              Cancel
            </Button>
            <GradientButton onClick={handleFormSubmit} disabled={formLoading} sx={{ color: "white" }}>
              {formLoading ? "Saving..." : dialogMode === "create" ? "Create" : "Update"}
            </GradientButton>
          </DialogActions>
        </Dialog>

        {/* Blog Details Dialog */}
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)",
              backdropFilter: "blur(20px)",
              borderRadius: "24px",
              border: "1px solid rgba(255,255,255,0.2)",
            },
          }}
        >
          <DialogTitle>
            <Typography variant="h5" fontWeight="700" sx={{ color: "#2d3748" }}>
              Blog Details
            </Typography>
          </DialogTitle>
          <DialogContent>
            {selectedBlog && (
              <Box>
                <Typography variant="h4" fontWeight="800" sx={{ color: "#2d3748", mb: 2 }}>
                  {selectedBlog.title}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                  {selectedBlog.shortDescription}
                </Typography>
                <Box sx={{ my: 3 }}>
                  {selectedBlog.featuredImage && (
                    <img
                      src={
                        selectedBlog.featuredImage.startsWith("http")
                          ? selectedBlog.featuredImage
                          : `${process.env.REACT_APP_API_URL?.replace("/api", "")}/${selectedBlog.featuredImage.replace(/^\/+/, "")}`
                      }
                      alt="Featured"
                      style={{
                        maxWidth: "100%",
                        borderRadius: "16px",
                        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.2)",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none"
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ my: 3 }}>
                  <div dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
                </Box>
                <Box sx={{ my: 3 }} display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    label={selectedBlog.category?.name}
                    sx={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={selectedBlog.isPublished ? "Published" : "Draft"}
                    sx={{
                      background: selectedBlog.isPublished
                        ? "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                        : "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                  {selectedBlog.isFeatured && (
                    <Chip
                      label="Featured"
                      sx={{
                        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Author: {selectedBlog.author?.fullName} |{" "}
                  {selectedBlog.createdAt && new Date(selectedBlog.createdAt).toLocaleString()}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <GradientButton onClick={() => setDetailsOpen(false)} sx={{ color: "white" }}>
              Close
            </GradientButton>
          </DialogActions>
        </Dialog>

        {/* Category Dialog */}
        <Dialog
          open={categoryDialogOpen}
          onClose={() => setCategoryDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)",
              backdropFilter: "blur(20px)",
              borderRadius: "24px",
              border: "1px solid rgba(255,255,255,0.2)",
            },
          }}
        >
          <DialogTitle>
            <Typography variant="h5" fontWeight="700" sx={{ color: "#2d3748" }}>
              Add Category
            </Typography>
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Category Name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
              InputProps={{
                sx: {
                  borderRadius: "12px",
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setCategoryDialogOpen(false)}
              disabled={categoryLoading}
              sx={{ borderRadius: "12px" }}
            >
              Cancel
            </Button>
            <GradientButton
              onClick={handleAddCategory}
              disabled={categoryLoading || !newCategory.trim()}
              sx={{ color: "white" }}
            >
              {categoryLoading ? "Adding..." : "Add"}
            </GradientButton>
          </DialogActions>
        </Dialog>

        {/* Comments Management Dialog */}
        <MuiDialog
          open={commentsDialogOpen}
          onClose={() => setCommentsDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <MuiDialogTitle>
            <span style={{ fontWeight: 700, fontSize: "1.3rem", color: "#764ba2" }}>
              Blog Comments Moderation
            </span>
          </MuiDialogTitle>
          <MuiDialogContent>
            {commentsLoading ? (
              <Typography>Loading comments...</Typography>
            ) : comments.length === 0 ? (
              <Typography>No comments found.</Typography>
            ) : (
              <Box>
                {comments.map((comment) => (
                  <Paper
                    key={comment.id}
                    sx={{
                      p: 2,
                      mb: 2,
                      borderLeft: comment.isApproved
                        ? "4px solid #22c55e"
                        : "4px solid #f59e42",
                      background: comment.isApproved
                        ? "linear-gradient(90deg, #e0ffe7 0%, #f0fff4 100%)"
                        : "linear-gradient(90deg, #fff7e0 0%, #fffaf0 100%)",
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography fontWeight={700} color="#2563eb">
                          {comment.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {comment.comment}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {comment.createdAt && new Date(comment.createdAt).toLocaleString()} | Blog: {comment.blog?.title}
                        </Typography>
                      </Box>
                      <Box display="flex" gap={1}>
                        {!comment.isApproved ? (
                          <Button
                            size="small"
                            color="success"
                            variant="contained"
                            startIcon={<CheckIcon />}
                            sx={{
                              borderRadius: "20px",
                              fontWeight: 600,
                              px: 2,
                              background: "linear-gradient(90deg, #22c55e 0%, #4ade80 100%)",
                              color: "#fff",
                            }}
                            onClick={() => handleModerateComment(comment.id, true)}
                          >
                            Approve
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            color="warning"
                            variant="contained"
                            startIcon={<CloseIcon />}
                            sx={{
                              borderRadius: "20px",
                              fontWeight: 600,
                              px: 2,
                              background: "linear-gradient(90deg, #f59e42 0%, #fbbf24 100%)",
                              color: "#fff",
                            }}
                            onClick={() => handleModerateComment(comment.id, false)}
                          >
                            Reject
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </MuiDialogContent>
          <MuiDialogActions>
            <Button onClick={() => setCommentsDialogOpen(false)} sx={{ fontWeight: 600 }}>
              Close
            </Button>
          </MuiDialogActions>
        </MuiDialog>
      </Container>
    </Box>
  )
}

export default Blogs
