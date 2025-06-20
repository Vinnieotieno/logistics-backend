// src/pages/Jobs.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Paper,
  TextField,
  InputAdornment,
  Avatar,
  AvatarGroup,
  Tab,
  Tabs,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  Fade,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  MoreVert,
  Work,
  LocationOn,
  AccessTime,
  AttachMoney,
  People,
  Visibility,
  FileCopy,
  Archive,
  CalendarToday,
  BusinessCenter,
  ListAlt,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import debounce from 'lodash.debounce';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const GradientHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(46, 125, 50, 0.3)',
}));

const JobCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(76, 175, 80, 0.2)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)',
  },
}));

const StatusBadge = styled(Badge)(({ theme, status }) => {
  const colors = {
    active: theme.palette.success.main,
    draft: theme.palette.grey[400],
    closed: theme.palette.error.main,
  };
  
  return {
    '& .MuiBadge-badge': {
      backgroundColor: colors[status] || colors.draft,
      color: colors[status] || colors.draft,
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        animation: status === 'active' ? 'ripple 1.2s infinite ease-in-out' : 'none',
        border: '1px solid currentColor',
        content: '""',
      },
    },
    '@keyframes ripple': {
      '0%': {
        transform: 'scale(.8)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(2.4)',
        opacity: 0,
      },
    },
  };
});

const Jobs = () => {
  // UI state
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuJobId, setMenuJobId] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editJobId, setEditJobId] = useState(null);

  // Data state
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, pages: 1 });

  // Job creation form state
  const [form, setForm] = useState({
    title: '',
    department: '',
    jobType: '',
    location: '',
    description: '',
    requirements: '',
    responsibilities: '',
    applicationDeadline: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // Applications dialog state
  const [applicationsDialog, setApplicationsDialog] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [selectedJobForApplications, setSelectedJobForApplications] = useState(null);

  // Bulk selection and status update state
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Debounce search input handler
  const debouncedSetSearchTerm = React.useMemo(() => debounce(setSearchTerm, 300), []);

  // Fetch jobs and stats
  useEffect(() => {
    fetchJobs();
    fetchStats();
    // eslint-disable-next-line
  }, [selectedTab, searchTerm, pagination.page]);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      let params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
      };
      // Tab filtering
      if (selectedTab === 1) {
        params.published = true;
        params.closed = false;
      }
      if (selectedTab === 2) {
        params.published = false;
      }
      if (selectedTab === 3) {
        params.closed = true;
      }

      const res = await axios.get(`${API_BASE}/jobs`, {
        params,
        withCredentials: true
      });
      setJobs(res.data.data.jobs);
      setPagination(prev => ({
        ...prev,
        total: res.data.data.pagination.total,
        pages: res.data.data.pagination.pages
      }));
    } catch (err) {
      setError('Failed to load jobs');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/jobs/stats`, { withCredentials: true });
      const d = res.data.data;
      setStats([
        { label: 'Active Jobs', value: d.jobs.published, icon: <Work />, color: '#4caf50' },
        { label: 'Total Applicants', value: d.applications.total, icon: <People />, color: '#2196f3' },
        { label: 'New This Week', value: d.applicationTrend.slice(-7).reduce((a, b) => a + b.count, 0), icon: <CalendarToday />, color: '#ff9800' },
      ]);
    } catch (err) {
      // ignore stats error
    }
  };

  // Handle search input
  const handleSearchInput = (e) => {
    setSearchInput(e.target.value);
    debouncedSetSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle tab change
  const handleTabChange = (e, newValue) => {
    setSelectedTab(newValue);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle menu open/close
  const handleMenuOpen = (e, jobId) => {
    setAnchorEl(e.currentTarget);
    setMenuJobId(jobId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuJobId(null);
  };

  // Handle job delete
  const handleDelete = async () => {
    if (!menuJobId) return;
    try {
      await axios.delete(`${API_BASE}/jobs/${menuJobId}`, { withCredentials: true });
      fetchJobs();
    } catch (err) {
      // handle error
    }
    handleMenuClose();
  };

  // Open edit dialog with job data
  const handleEdit = (job) => {
    setForm({
      title: job.title,
      department: job.department,
      jobType: job.jobType,
      location: job.location,
      description: job.description,
      requirements: job.requirements || '',
      responsibilities: job.responsibilities || '',
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : ''
    });
    setEditJobId(job.id);
    setEditMode(true);
    setCreateDialog(true);
    handleMenuClose();
  };

  // Archive (unpublish) job
  const handleArchive = async () => {
    if (!menuJobId) return;
    try {
      await axios.put(
        `${API_BASE}/jobs/${menuJobId}`,
        { isPublished: false },
        { withCredentials: true }
      );
      fetchJobs();
    } catch (err) {
      // handle error
    }
    handleMenuClose();
  };

  // Close job
  const handleCloseJob = async () => {
    if (!menuJobId) return;
    try {
      await axios.patch(`${API_BASE}/jobs/${menuJobId}/close`, {}, { withCredentials: true });
      fetchJobs();
    } catch (err) {
      // handle error
    }
    handleMenuClose();
  };

  // Handle job creation and update
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleCreateJob = async () => {
    setFormLoading(true);
    try {
      const payload = {
        ...form,
        description: form.description,
        requirements: form.requirements,
        responsibilities: form.responsibilities,
        applicationDeadline: form.applicationDeadline,
        isPublished: true
      };
      if (editMode && editJobId) {
        await axios.put(
          `${API_BASE}/jobs/${editJobId}`,
          payload,
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${API_BASE}/jobs`,
          payload,
          { withCredentials: true }
        );
      }
      setCreateDialog(false);
      setForm({
        title: '',
        department: '',
        jobType: '',
        location: '',
        description: '',
        requirements: '',
        responsibilities: '',
        applicationDeadline: ''
      });
      setEditMode(false);
      setEditJobId(null);
      fetchJobs();
    } catch (err) {
      // handle error
    }
    setFormLoading(false);
  };

  // Fetch applications for a job
  const handleViewApplications = async (job) => {
    setSelectedJobForApplications(job);
    setApplicationsDialog(true);
    setApplicationsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/jobs/applications`, {
        params: { jobId: job.id },
        withCredentials: true
      });
      setApplications(res.data.data.applications || []);
    } catch (err) {
      setApplications([]);
    }
    setApplicationsLoading(false);
  };

  // Handle applicant selection
  const handleApplicantSelect = (id) => {
    setSelectedApplicants(prev =>
      prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
    );
  };
  const handleSelectAllApplicants = (checked) => {
    if (checked) {
      setSelectedApplicants(applications.map(app => app.id));
    } else {
      setSelectedApplicants([]);
    }
  };

  // Handle single status update
  const handleSingleStatusChange = async (appId, status) => {
    setStatusLoading(true);
    try {
      await axios.patch(
        `${API_BASE}/jobs/applications/${appId}/status`,
        { status },
        { withCredentials: true }
      );
      setSnackbar({ open: true, message: 'Status updated and email sent.', severity: 'success' });
      // Refresh applications
      handleViewApplications(selectedJobForApplications);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update status.', severity: 'error' });
    }
    setStatusLoading(false);
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedApplicants.length === 0) return;
    setStatusLoading(true);
    try {
      await axios.patch(
        `${API_BASE}/jobs/applications/bulk-status`,
        { applicationIds: selectedApplicants, status: bulkStatus },
        { withCredentials: true }
      );
      setSnackbar({ open: true, message: 'Bulk status updated and emails sent.', severity: 'success' });
      // Refresh applications
      handleViewApplications(selectedJobForApplications);
      setSelectedApplicants([]);
      setBulkStatus('');
    } catch (err) {
      setSnackbar({ open: true, message: 'Bulk update failed.', severity: 'error' });
    }
    setStatusLoading(false);
  };

  // Pagination controls
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Memoize JobCard and StatusBadge if defined inline
  const MemoJobCard = React.memo(JobCard);
  const MemoStatusBadge = React.memo(StatusBadge);

  // Memoize jobs list rendering
  const renderedJobs = React.useMemo(() => (
    jobs.map((job) => (
      <Grid item xs={12} md={6} lg={4} key={job.id}>
        <MemoJobCard>
          <CardContent sx={{ flexGrow: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
              <MemoStatusBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                variant="dot"
                status={job.isPublished ? 'active' : 'draft'}
              >
                <Typography variant="h6" fontWeight="bold">
                  {job.title}
                </Typography>
              </MemoStatusBadge>
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, job.id)}
              >
                <MoreVert />
              </IconButton>
            </Box>

            <Stack spacing={1} sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <BusinessCenter fontSize="small" color="action" />
                <Typography variant="body2">{job.department}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2">{job.location}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <AccessTime fontSize="small" color="action" />
                <Typography variant="body2">
                  Deadline: {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
            </Stack>

            {/* Show Qualifications and Responsibilities */}
            {job.requirements && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Qualifications:</strong> {job.requirements.slice(0, 60)}{job.requirements.length > 60 ? '...' : ''}
              </Typography>
            )}
            {job.responsibilities && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Responsibilities:</strong> {job.responsibilities.slice(0, 60)}{job.responsibilities.length > 60 ? '...' : ''}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              {job.description?.slice(0, 120)}{job.description?.length > 120 ? '...' : ''}
            </Typography>
          </CardContent>

          <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <AvatarGroup max={4}>
                {(job.recentApplications || []).map((app, i) => (
                  <Tooltip title={app.name} key={app.id}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {app.name?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
              <Button
                size="small"
                startIcon={<Visibility />}
                sx={{ textTransform: 'none' }}
                onClick={() => handleViewApplications(job)}
              >
                View Applications
              </Button>
            </Box>
          </Box>
        </MemoJobCard>
      </Grid>
    ))
  ), [jobs]);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [debouncedSetSearchTerm]);

  return (
    <Box>
      <GradientHeader>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Job Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Create and manage job postings and applications
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
            Post New Job
          </Button>
        </Box>
      </GradientHeader>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}30 100%)`,
                borderLeft: `4px solid ${stat.color}`,
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color={stat.color}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: stat.color, width: 48, height: 48 }}>
                  {stat.icon}
                </Avatar>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="All Jobs" />
            <Tab
              label={
                <Badge badgeContent={stats[0]?.value || 0} color="success">
                  Active
                </Badge>
              }
            />
            <Tab label="Drafts" />
            <Tab label="Closed" />
          </Tabs>
          <TextField
            placeholder="Search jobs..."
            size="small"
            value={searchInput}
            onChange={handleSearchInput}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
        </Box>
      </Paper>

      {loading ? (
        <Box textAlign="center" py={5}><Typography>Loading...</Typography></Box>
      ) : error ? (
        <Box textAlign="center" py={5}><Typography color="error">{error}</Typography></Box>
      ) : (
        <Grid container spacing={3}>
          {renderedJobs}
        </Grid>
      )}

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={4}>
        {[...Array(pagination.pages)].map((_, idx) => (
          <Button
            key={idx}
            variant={pagination.page === idx + 1 ? 'contained' : 'outlined'}
            size="small"
            sx={{ mx: 0.5 }}
            onClick={() => handlePageChange(idx + 1)}
          >
            {idx + 1}
          </Button>
        ))}
      </Box>

      {/* Job Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            const job = jobs.find(j => j.id === menuJobId);
            if (job) handleEdit(job);
          }}
        >
          <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleArchive}>
          <Archive fontSize="small" sx={{ mr: 1 }} /> Archive
        </MenuItem>
        <MenuItem onClick={handleCloseJob}>
          <FileCopy fontSize="small" sx={{ mr: 1 }} /> Close
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Create Job Dialog */}
      <Dialog open={createDialog} onClose={() => { setCreateDialog(false); setEditMode(false); setEditJobId(null); }} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Job' : 'Post New Job'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  label="Department"
                  name="department"
                  value={form.department}
                  onChange={handleFormChange}
                  required
                >
                  <MenuItem value="Operations">Operations</MenuItem>
                  <MenuItem value="Warehouse">Warehouse</MenuItem>
                  <MenuItem value="Transportation">Transportation</MenuItem>
                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="Communication and Marketing">Communication and Marketing</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Customer Service">Customer Service</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  label="Job Type"
                  name="jobType"
                  value={form.jobType}
                  onChange={handleFormChange}
                  required
                >
                  <MenuItem value="full-time">Full Time</MenuItem>
                  <MenuItem value="part-time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="internship">Internship</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={form.location}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Application Deadline"
                name="applicationDeadline"
                type="date"
                value={form.applicationDeadline}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Description"
                name="description"
                multiline
                rows={3}
                value={form.description}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Qualifications"
                name="requirements"
                multiline
                rows={2}
                value={form.requirements}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Responsibilities"
                name="responsibilities"
                multiline
                rows={2}
                value={form.responsibilities}
                onChange={handleFormChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCreateDialog(false); setEditMode(false); setEditJobId(null); }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateJob}
            disabled={formLoading}
            sx={{
              background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
            }}
          >
            {formLoading ? (editMode ? 'Saving...' : 'Posting...') : (editMode ? 'Save Changes' : 'Post Job')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Applications Dialog */}
      <Dialog
        open={applicationsDialog}
        onClose={() => { setApplicationsDialog(false); setApplications([]); setSelectedJobForApplications(null); setSelectedApplicants([]); }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Applications for: {selectedJobForApplications?.title}
        </DialogTitle>
        <DialogContent>
          {/* Bulk controls */}
          {applications.length > 0 && (
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedApplicants.length === applications.length}
                    indeterminate={selectedApplicants.length > 0 && selectedApplicants.length < applications.length}
                    onChange={e => handleSelectAllApplicants(e.target.checked)}
                  />
                }
                label="Select All"
              />
              <Box display="flex" alignItems="center" gap={2}>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Bulk Status</InputLabel>
                  <Select
                    label="Bulk Status"
                    value={bulkStatus}
                    onChange={e => setBulkStatus(e.target.value)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="shortlisted">Shortlisted</MenuItem>
                    <MenuItem value="interview">Interview</MenuItem>
                    <MenuItem value="hired">Hired</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  disabled={statusLoading || !bulkStatus || selectedApplicants.length === 0}
                  onClick={handleBulkStatusUpdate}
                >
                  Update Selected
                </Button>
              </Box>
            </Box>
          )}
          {/* Applications list */}
          {applicationsLoading ? (
            <Box py={4} textAlign="center">
              <Typography>Loading applications...</Typography>
            </Box>
          ) : applications.length === 0 ? (
            <Box py={4} textAlign="center">
              <Typography>No applications found for this job.</Typography>
            </Box>
          ) : (
            <Box>
              {applications.map((app) => (
                <Paper key={app.id} sx={{ p: 2, mb: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Checkbox
                        checked={selectedApplicants.includes(app.id)}
                        onChange={() => handleApplicantSelect(app.id)}
                      />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">{app.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{app.email}</Typography>
                        <Typography variant="body2" color="text.secondary">{app.phone}</Typography>
                        <Typography variant="body2" color="text.secondary">Status: {app.status}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Applied: {app.createdAt ? new Date(app.createdAt).toLocaleString() : ''}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          label="Status"
                          value={app.status}
                          onChange={e => handleSingleStatusChange(app.id, e.target.value)}
                          disabled={statusLoading}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="shortlisted">Shortlisted</MenuItem>
                          <MenuItem value="interview">Interview</MenuItem>
                          <MenuItem value="hired">Hired</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                  {app.coverLetter && (
                    <Box mt={1}>
                      <Typography variant="body2" fontWeight="bold">Cover Letter:</Typography>
                      <Typography variant="body2" color="text.secondary">{app.coverLetter}</Typography>
                    </Box>
                  )}
                  {app.resumeUrl && (
                    <Box mt={1}>
                      <Button
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1 }}
                      >
                        Download Resume
                      </Button>
                    </Box>
                  )}
                  {app.portfolioUrl && (
                    <Box mt={1}>
                      <Button
                        href={app.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1, ml: 1 }}
                      >
                        View Portfolio
                      </Button>
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setApplicationsDialog(false); setApplications([]); setSelectedJobForApplications(null); setSelectedApplicants([]); }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Jobs;