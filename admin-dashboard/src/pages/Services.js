// src/pages/Services.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Grid,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Fab,
  Avatar,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  LocalShipping,
  CheckCircle,
  MoreVert,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || "/admin/api";

const GradientHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 40px rgba(76, 175, 80, 0.3)',
  },
}));

const Services = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    description: '',
    keyBenefits: [],
    imageUrl: '',
    galleryUrls: [],
    isPublished: false,
    metaTitle: '',
    metaDescription: '',
    faq: [], // <-- Add FAQ field
  });
  const [selectedService, setSelectedService] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, limit: 10, total: 0 });
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {
          search: searchTerm || undefined,
          page: pagination.page,
          limit: pagination.limit,
        };
        const res = await axios.get(`${API_URL}/services`, { params, withCredentials: true });
        setServices(res.data.data.services || []);
        setPagination((prev) => ({
          ...prev,
          ...res.data.data.pagination,
        }));
      } catch (err) {
        setError('Failed to load services');
      }
      setLoading(false);
    };
    fetchServices();
    // eslint-disable-next-line
  }, [searchTerm, pagination.page]);

  // Open dialog for create/edit
  const handleOpenDialog = (mode = 'create', service = null) => {
    setDialogMode(mode);
    setImageFile(null);
    if (mode === 'edit' && service) {
      // Ensure all fields are present, fallback to empty/false/[] if missing
      setForm({
        title: service.title || '',
        shortDescription: service.shortDescription || '',
        description: service.description || '',
        keyBenefits: service.keyBenefits || [],
        imageUrl: service.imageUrl || '',
        galleryUrls: service.galleryUrls || [],
        isPublished: typeof service.isPublished === 'boolean' ? service.isPublished : false,
        metaTitle: service.metaTitle || '',
        metaDescription: service.metaDescription || '',
        id: service.id,
        faq: service.faq || [],
        slug: service.slug || '',
        overview: service.overview || '',
        serviceCoverage: service.serviceCoverage || '',
        howToBook: service.howToBook || '',
        createdBy: service.createdBy || '',
        createdAt: service.createdAt || '',
        updatedAt: service.updatedAt || '',
      });
    } else {
      setForm({
        title: '',
        shortDescription: '',
        description: '',
        keyBenefits: [],
        imageUrl: '',
        galleryUrls: [],
        isPublished: false,
        metaTitle: '',
        metaDescription: '',
        faq: [],
        slug: '',
        overview: '',
        serviceCoverage: '',
        howToBook: '',
        createdBy: '',
        createdAt: '',
        updatedAt: '',
      });
    }
    setDialogOpen(true);
  };

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle keyBenefits and galleryUrls as comma separated
  const handleArrayFieldChange = (name, value) => {
    setForm((f) => ({
      ...f,
      [name]: value.split(',').map((v) => v.trim()).filter(Boolean),
    }));
  };

  // Handle image file change
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Handle FAQ change
  const handleFaqChange = (idx, field, value) => {
    setForm((f) => {
      const faq = [...(f.faq || [])];
      faq[idx][field] = value;
      return { ...f, faq };
    });
  };

  const handleAddFaq = () => {
    setForm((f) => ({
      ...f,
      faq: [...(f.faq || []), { question: '', answer: '' }]
    }));
  };

  const handleRemoveFaq = (idx) => {
    setForm((f) => {
      const faq = [...(f.faq || [])];
      faq.splice(idx, 1);
      return { ...f, faq };
    });
  };

  // Create or update service
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      let data;
      let headers = {};
      if (imageFile) {
        // Use multipart/form-data
        data = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          if (key === 'keyBenefits' || key === 'galleryUrls') {
            data.append(key, Array.isArray(value) ? value.join(',') : value);
          } else if (key === 'faq') {
            data.append('faq', JSON.stringify(value || []));
          } else {
            data.append(key, value);
          }
        });
        data.append('image', imageFile);
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        // Use JSON
        data = {
          ...form,
          keyBenefits: Array.isArray(form.keyBenefits) ? form.keyBenefits : [],
          galleryUrls: Array.isArray(form.galleryUrls) ? form.galleryUrls : [],
          faq: form.faq || [],
          isPublished: form.isPublished === true || form.isPublished === 'true',
        };
        headers['Content-Type'] = 'application/json';
      }
      if (dialogMode === 'create') {
        await axios.post(`${API_URL}/services`, data, { withCredentials: true, headers });
        toast.success('Service created');
      } else {
        // Only send fields that have changed for update
        await axios.put(`${API_URL}/services/${form.id}`, data, { withCredentials: true, headers });
        toast.success('Service updated');
      }
      setDialogOpen(false);
      setFormLoading(false);
      setImageFile(null);
      setPagination((p) => ({ ...p, page: 1 }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving service');
      setFormLoading(false);
    }
  };

  // Delete service
  const handleDelete = async (service) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await axios.delete(`${API_URL}/services/${service.id}`, { withCredentials: true });
      toast.success('Service deleted');
      setPagination((p) => ({ ...p, page: 1 }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting service');
    }
    setAnchorEl(null);
  };

  // Toggle publish status
  const handleTogglePublish = async (service) => {
    try {
      await axios.patch(`${API_URL}/services/${service.id}/toggle-publish`, {}, { withCredentials: true });
      toast.success('Publish status updated');
      setPagination((p) => ({ ...p, page: 1 }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error toggling publish');
    }
    setAnchorEl(null);
  };

  // View details
  const handleViewDetails = (service) => {
    setSelectedService(service);
    setAnchorEl(null);
  };

  return (
    <Box>
      <GradientHeader>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Services Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Manage your logistics services and offerings
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
            <LocalShipping />
          </Avatar>
        </Box>
      </GradientHeader>

      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'rgba(76, 175, 80, 0.05)' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="large"
              sx={{
                background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
                boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
              }}
              onClick={() => handleOpenDialog('create')}
            >
              Add New Service
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress color="success" />
        </Box>
      ) : error ? (
        <Typography color="error" align="center" variant="h6">
          {error}
        </Typography>
      ) : services.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No services found
          </Typography>
          <Typography color="text.secondary">Start adding your services!</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {services.map((service) => {
            // Compute the correct image URL
            let imageUrl = `${process.env.REACT_APP_API_URL || '/admin/api'}/placeholder/400/300`;
            if (service.imageUrl) {
              imageUrl = service.imageUrl.startsWith('/uploads/')
                ? `${process.env.REACT_APP_API_URL?.replace('/api', '')}${service.imageUrl}`
                : service.imageUrl;
            }
            return (
              <Grid item xs={12} sm={6} md={4} key={service.id}>
                <StyledCard>
                  <CardMedia
                    component="img"
                    height="200"
                    image={imageUrl}
                    alt={service.title}
                    sx={{
                      background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" fontWeight="bold">
                        {service.title}
                      </Typography>
                      <Chip
                        label={service.isPublished ? 'Published' : 'Draft'}
                        color={service.isPublished ? 'primary' : 'default'}
                        size="small"
                        icon={<CheckCircle />}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {service.shortDescription}
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {service.keyBenefits && service.keyBenefits.length > 0 && (
                        <Chip
                          label={`Key Benefits: ${service.keyBenefits.join(', ')}`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box>
                      <Tooltip title="View Details">
                        <IconButton color="primary" onClick={() => handleViewDetails(service)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Tooltip title="Edit">
                      <IconButton color="primary" onClick={() => handleOpenDialog('edit', service)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(service)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More">
                      <IconButton onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedService(service); }}>
                        <MoreVert />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </StyledCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => { setAnchorEl(null); handleOpenDialog('edit', selectedService); }}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleViewDetails(selectedService)}>
          <Visibility fontSize="small" sx={{ mr: 1 }} /> View
        </MenuItem>
        <MenuItem onClick={() => handleTogglePublish(selectedService)}>
          <CheckCircle fontSize="small" sx={{ mr: 1 }} /> {selectedService?.isPublished ? 'Unpublish' : 'Publish'}
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedService)} sx={{ color: "error.main" }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="700">
            {dialogMode === 'create' ? 'Create Service' : 'Edit Service'}
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
              sx={{ mb: 2 }}
            />
            <TextField
              label="Short Description"
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleFormChange}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              fullWidth
              multiline
              minRows={3}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Key Benefits (comma separated)"
              name="keyBenefits"
              value={Array.isArray(form.keyBenefits) ? form.keyBenefits.join(',') : form.keyBenefits}
              onChange={(e) => handleArrayFieldChange('keyBenefits', e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Image URL"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleFormChange}
              fullWidth
              sx={{ mb: 2 }}
              helperText="Or upload an image below"
            />
            <Box sx={{ mb: 2 }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  border: "2px dashed #4caf50",
                  width: "100%",
                  background: "rgba(76, 175, 80, 0.05)",
                }}
              />
            </Box>
            <TextField
              label="Gallery URLs (comma separated)"
              name="galleryUrls"
              value={Array.isArray(form.galleryUrls) ? form.galleryUrls.join(',') : form.galleryUrls}
              onChange={(e) => handleArrayFieldChange('galleryUrls', e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Published</InputLabel>
              <Select
                name="isPublished"
                value={form.isPublished}
                label="Published"
                onChange={handleFormChange}
              >
                <MenuItem value={true}>Yes</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Meta Title"
              name="metaTitle"
              value={form.metaTitle}
              onChange={handleFormChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Meta Description"
              name="metaDescription"
              value={form.metaDescription}
              onChange={handleFormChange}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Slug"
              name="slug"
              value={form.slug}
              onChange={handleFormChange}
              fullWidth
              sx={{ mb: 2 }}
              disabled={dialogMode === 'edit'} // usually slug is auto-generated and not editable after creation
            />
            <TextField
              label="Overview"
              name="overview"
              value={form.overview}
              onChange={handleFormChange}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Service Coverage"
              name="serviceCoverage"
              value={form.serviceCoverage}
              onChange={handleFormChange}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 2 }}
            />
            <TextField
              label="How To Book"
              name="howToBook"
              value={form.howToBook}
              onChange={handleFormChange}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 2 }}
            />
            {/* FAQ Section - place here, right after actionable/meta fields */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Frequently Asked Questions (FAQ)
              </Typography>
              {(form.faq || []).map((item, idx) => (
                <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, background: '#f9fbe7' }}>
                  <TextField
                    label={`Question ${idx + 1}`}
                    value={item.question}
                    onChange={e => handleFaqChange(idx, 'question', e.target.value)}
                    fullWidth
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    label="Answer"
                    value={item.answer}
                    onChange={e => handleFaqChange(idx, 'answer', e.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    sx={{ mb: 1 }}
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleRemoveFaq(idx)}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleAddFaq}
              >
                Add FAQ
              </Button>
            </Box>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} disabled={formLoading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={formLoading}
                sx={{ color: 'white', background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)' }}
              >
                {formLoading ? 'Saving...' : dialogMode === 'create' ? 'Create' : 'Update'}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={!!selectedService}
        onClose={() => setSelectedService(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="700">
            Service Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedService && (
            <Box>
              <Typography variant="h4" fontWeight="800" sx={{ mb: 2 }}>
                {selectedService.title}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                {selectedService.shortDescription}
              </Typography>
              {selectedService.imageUrl && (
                <Box sx={{ my: 2 }}>
                  <img
                    src={selectedService.imageUrl.startsWith('/uploads/')
                      ? `${process.env.REACT_APP_API_URL?.replace('/api', '')}${selectedService.imageUrl}`
                      : selectedService.imageUrl}
                    alt="Service"
                    style={{
                      maxWidth: '100%',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(76, 175, 80, 0.2)',
                    }}
                  />
                </Box>
              )}
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedService.description}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>Key Benefits:</Typography>
                <ul>
                  {(selectedService.keyBenefits || []).map((b, i) => (
                    <li key={i}><Typography variant="body2">{b}</Typography></li>
                  ))}
                </ul>
              </Box>
              <Box sx={{ my: 2 }} display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label={selectedService.isPublished ? 'Published' : 'Draft'}
                  color={selectedService.isPublished ? 'primary' : 'default'}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Created By: {selectedService.creator?.fullName} | {selectedService.creator?.email}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedService(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
        }}
        onClick={() => handleOpenDialog('create')}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default Services;