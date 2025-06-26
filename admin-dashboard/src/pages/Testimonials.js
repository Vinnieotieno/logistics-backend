// src/pages/Testimonials.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Rating,
  IconButton,
  Button,
  TextField,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Star,
  FormatQuote,
  MoreVert,
  CheckCircle,
  Cancel,
  Business,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const GradientHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #00695c 0%, #4db6ac 100%)',
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0, 105, 92, 0.3)',
}));

const TestimonialCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(76, 175, 80, 0.15)',
  },
}));

const QuoteIcon = styled(FormatQuote)(({ theme }) => ({
  fontSize: 48,
  color: theme.palette.primary.light,
  opacity: 0.2,
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
}));

const API_BASE = process.env.REACT_APP_API_URL || 'http://globeflight.co.ke/api';

const Testimonials = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [filterPublished, setFilterPublished] = useState('all');
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [form, setForm] = useState({
    name: '', position: '', company: '', content: '', rating: 5, isPublished: true
  });
  const [formLoading, setFormLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [requestDialog, setRequestDialog] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Fetch testimonials and stats
  useEffect(() => {
    fetchTestimonials();
    fetchStats();
    // eslint-disable-next-line
  }, [filterPublished]);

  const fetchTestimonials = async () => {
    setLoading(true);
    setError('');
    try {
      let params = {};
      if (filterPublished === 'published') params.published = true;
      if (filterPublished === 'unpublished') params.published = false;
      const res = await axios.get(`${API_BASE}/testimonials`, { params, withCredentials: true });
      setTestimonials(res.data.data.testimonials);
    } catch (err) {
      setError('Failed to load testimonials');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/testimonials/stats`, { withCredentials: true });
      const d = res.data.data;
      setStats([
        { label: 'Total Testimonials', value: d.total, color: '#4caf50' },
        { label: 'Published', value: d.published, color: '#2196f3' },
        { label: 'Average Rating', value: d.avgRating, color: '#ff9800' },
        { label: 'Drafts', value: d.drafts, color: '#9c27b0' },
      ]);
    } catch {}
  };

  // Handle create/edit dialog open
  const handleOpenDialog = (testimonial = null) => {
    if (testimonial) {
      setForm({
        name: testimonial.name,
        position: testimonial.position,
        company: testimonial.company,
        content: testimonial.content,
        rating: testimonial.rating,
        isPublished: testimonial.isPublished
      });
      setEditMode(true);
      setSelectedTestimonial(testimonial);
    } else {
      setForm({ name: '', position: '', company: '', content: '', rating: 5, isPublished: true });
      setEditMode(false);
      setSelectedTestimonial(null);
    }
    setCreateDialog(true);
  };

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  // Handle create/update testimonial
  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      if (editMode && selectedTestimonial) {
        await axios.put(`${API_BASE}/testimonials/${selectedTestimonial.id}`, form, { withCredentials: true });
      } else {
        await axios.post(`${API_BASE}/testimonials`, form, { withCredentials: true });
      }
      setCreateDialog(false);
      fetchTestimonials();
      fetchStats();
    } catch {}
    setFormLoading(false);
  };

  // Handle delete
  const handleDelete = async (id) => {
    await axios.delete(`${API_BASE}/testimonials/${id}`, { withCredentials: true });
    fetchTestimonials();
    fetchStats();
    setAnchorEl(null);
  };

  // Handle publish toggle
  const handleTogglePublish = async (id) => {
    await axios.patch(`${API_BASE}/testimonials/${id}/toggle-publish`, {}, { withCredentials: true });
    fetchTestimonials();
    fetchStats();
    setAnchorEl(null);
  };

  // Handle request testimonial (send email)
  const handleRequestTestimonial = async () => {
    setRequestLoading(true);
    try {
      await axios.post(`${API_BASE}/testimonials/request`, { email: requestEmail }, { withCredentials: true });
      setRequestDialog(false);
      setRequestEmail('');
      setRequestSuccess(true); // Show success snackbar
    } catch {}
    setRequestLoading(false);
  };

  return (
    <Box>
      <GradientHeader>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Testimonials
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Manage customer testimonials and reviews
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialog(true)}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            Add Testimonial
          </Button>
        </Box>
      </GradientHeader>

      <Button
        variant="outlined"
        sx={{ ml: 2 }}
        onClick={() => setRequestDialog(true)}
      >
        Request Testimonial
      </Button>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}30 100%)`,
                borderTop: `3px solid ${stat.color}`,
              }}
            >
              <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
              {stat.label === 'Average Rating' && (
                <Rating value={4.8} precision={0.1} readOnly size="small" sx={{ mt: 1 }} />
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2}>
          <Button
            variant={filterPublished === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilterPublished('all')}
            sx={filterPublished === 'all' ? {
              background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
            } : {}}
          >
            All ({testimonials.length})
          </Button>
          <Button
            variant={filterPublished === 'published' ? 'contained' : 'outlined'}
            onClick={() => setFilterPublished('published')}
            sx={filterPublished === 'published' ? {
              background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
            } : {}}
          >
            Published ({testimonials.filter(t => t.isPublished).length})
          </Button>
          <Button
            variant={filterPublished === 'unpublished' ? 'contained' : 'outlined'}
            onClick={() => setFilterPublished('unpublished')}
            sx={filterPublished === 'unpublished' ? {
              background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
            } : {}}
          >
            Unpublished ({testimonials.filter(t => !t.isPublished).length})
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Box textAlign="center" py={5}><Typography>Loading...</Typography></Box>
      ) : error ? (
        <Box textAlign="center" py={5}><Typography color="error">{error}</Typography></Box>
      ) : (
        <Grid container spacing={3}>
          {testimonials.map((testimonial) => (
            <Grid item xs={12} md={6} lg={4} key={testimonial.id}>
              <TestimonialCard>
                <QuoteIcon />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Rating value={testimonial.rating} readOnly />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedTestimonial(testimonial);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography variant="body1" paragraph sx={{ fontStyle: 'italic' }}>
                    "{testimonial.content}"
                  </Typography>

                  <Box display="flex" alignItems="center" gap={2} mt={3}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                      {testimonial.name.charAt(0)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight="600">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.position}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Business fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {testimonial.company}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography variant="caption" color="text.secondary">
                      {testimonial.date}
                    </Typography>
                    <Chip
                      label={testimonial.isPublished ? 'Published' : 'Unpublished'}
                      size="small"
                      color={testimonial.isPublished ? 'success' : 'default'}
                      icon={testimonial.isPublished ? <CheckCircle /> : <Cancel />}
                    />
                  </Box>
                </CardContent>
              </TestimonialCard>
            </Grid>
          ))}
        </Grid>
      )}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => { handleOpenDialog(selectedTestimonial); setAnchorEl(null); }}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => { handleTogglePublish(selectedTestimonial.id); }}>
          <CheckCircle fontSize="small" sx={{ mr: 1 }} /> Toggle Publish
        </MenuItem>
        <MenuItem onClick={() => { handleDelete(selectedTestimonial.id); }} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
      {/* Create/Edit Testimonial Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Testimonial' : 'Add New Testimonial'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Customer Name" name="name" value={form.name} onChange={handleFormChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Position" name="position" value={form.position} onChange={handleFormChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Company" name="company" value={form.company} onChange={handleFormChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Rating
                </Typography>
                <Rating name="rating" value={form.rating} onChange={(_, v) => setForm(f => ({ ...f, rating: v }))} size="large" />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Testimonial"
                name="content"
                multiline
                rows={4}
                value={form.content}
                onChange={handleFormChange}
                placeholder="Write the customer testimonial here..."
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={form.isPublished} name="isPublished" onChange={handleFormChange} />}
                label="Publish immediately"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={formLoading}
            sx={{
              background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
            }}
          >
            {formLoading ? (editMode ? 'Saving...' : 'Adding...') : (editMode ? 'Save Changes' : 'Add Testimonial')}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Request Testimonial Dialog */}
      <Dialog open={requestDialog} onClose={() => setRequestDialog(false)}>
        <DialogTitle>Request Testimonial</DialogTitle>
        <DialogContent>
          <TextField
            label="Client Email"
            fullWidth
            value={requestEmail}
            onChange={e => setRequestEmail(e.target.value)}
            type="email"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRequestTestimonial}
            disabled={requestLoading}
          >
            {requestLoading ? 'Sending...' : 'Send Request'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Success Snackbar */}
      <Snackbar
        open={requestSuccess}
        autoHideDuration={4000}
        onClose={() => setRequestSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setRequestSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Testimonial request has been sent!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Testimonials;

// The publish toggle calls: /testimonials/:id/toggle-publish