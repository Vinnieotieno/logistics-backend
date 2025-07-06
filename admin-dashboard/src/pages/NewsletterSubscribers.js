import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Email,
  Delete,
  MoreVert,
  Person,
  CalendarToday,
  CheckCircle,
  Cancel,
  Download,
  Send,
  Refresh,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/admin/api';

const GradientHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
}));

const SubscriberCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(25, 118, 210, 0.15)',
  },
}));

const NewsletterSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 10, total: 0 });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch subscribers and stats
  useEffect(() => {
    fetchSubscribers();
    fetchStats();
    // eslint-disable-next-line
  }, [searchTerm, pagination.page, pagination.rowsPerPage]);

  const fetchSubscribers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: pagination.page + 1, // API uses 1-based pagination
        limit: pagination.rowsPerPage,
        search: searchTerm || undefined,
      };

      const res = await axios.get(`${API_BASE}/blogs/newsletter/subscribers`, {
        params,
        withCredentials: true
      });

      setSubscribers(res.data.data.subscribers || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.data.pagination?.total || 0
      }));
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      setError('Failed to load subscribers');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/blogs/newsletter/stats`, { withCredentials: true });
      const d = res.data.data;
      setStats([
        { label: 'Total Subscribers', value: d.total, color: '#1976d2' },
        { label: 'Active Subscribers', value: d.active, color: '#4caf50' },
        { label: 'Unsubscribed', value: d.unsubscribed, color: '#f44336' },
        { label: 'This Month', value: d.thisMonth, color: '#ff9800' },
      ]);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Handle search input
  const handleSearchInput = (e) => {
    setSearchInput(e.target.value);
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // Handle menu open/close
  const handleMenuOpen = (e, subscriber) => {
    setAnchorEl(e.currentTarget);
    setSelectedSubscriber(subscriber);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSubscriber(null);
  };

  // Handle delete subscriber
  const handleDelete = async () => {
    if (!selectedSubscriber) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`${API_BASE}/blogs/newsletter/subscribers/${selectedSubscriber.id}`, {
        withCredentials: true
      });
      setSnackbar({ open: true, message: 'Subscriber deleted successfully', severity: 'success' });
      fetchSubscribers();
      fetchStats();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete subscriber', severity: 'error' });
    }
    setDeleteLoading(false);
    setDeleteDialog(false);
    handleMenuClose();
  };

  // Handle unsubscribe
  const handleUnsubscribe = async () => {
    if (!selectedSubscriber) return;
    try {
      await axios.patch(`${API_BASE}/blogs/newsletter/subscribers/${selectedSubscriber.id}/unsubscribe`, {}, {
        withCredentials: true
      });
      setSnackbar({ open: true, message: 'Subscriber unsubscribed successfully', severity: 'success' });
      fetchSubscribers();
      fetchStats();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to unsubscribe', severity: 'error' });
    }
    handleMenuClose();
  };

  // Handle resubscribe
  const handleResubscribe = async () => {
    if (!selectedSubscriber) return;
    try {
      await axios.patch(`${API_BASE}/blogs/newsletter/subscribers/${selectedSubscriber.id}/resubscribe`, {}, {
        withCredentials: true
      });
      setSnackbar({ open: true, message: 'Subscriber resubscribed successfully', severity: 'success' });
      fetchSubscribers();
      fetchStats();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to resubscribe', severity: 'error' });
    }
    handleMenuClose();
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination(prev => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  // Export subscribers
  const handleExport = () => {
    const csvContent = [
      ['Email', 'Status', 'Subscribed Date', 'Unsubscribed Date'],
      ...subscribers.map(sub => [
        sub.email,
        sub.isActive ? 'Active' : 'Unsubscribed',
        sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '',
        sub.unsubscribedAt ? new Date(sub.unsubscribedAt).toLocaleDateString() : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <GradientHeader>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Newsletter Subscribers
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Manage your newsletter subscribers and track engagement
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExport}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => { fetchSubscribers(); fetchStats(); }}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </GradientHeader>

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
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
        <TextField
          placeholder="Search subscribers by email..."
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
      </Paper>

      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Subscribed Date</TableCell>
              <TableCell>Unsubscribed Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography>Loading subscribers...</Typography>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="error">{error}</Typography>
                </TableCell>
              </TableRow>
            ) : subscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography>No subscribers found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              subscribers.map((subscriber) => (
                <TableRow key={subscriber.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <Email fontSize="small" />
                      </Avatar>
                      <Typography variant="body2">{subscriber.email}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={subscriber.isActive ? 'Active' : 'Unsubscribed'}
                      color={subscriber.isActive ? 'success' : 'default'}
                      size="small"
                      icon={subscriber.isActive ? <CheckCircle /> : <Cancel />}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {subscriber.createdAt ? new Date(subscriber.createdAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {subscriber.unsubscribedAt ? new Date(subscriber.unsubscribedAt).toLocaleDateString() : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, subscriber)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.rowsPerPage}
          page={pagination.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedSubscriber?.isActive ? (
          <MenuItem onClick={handleUnsubscribe}>
            <Cancel fontSize="small" sx={{ mr: 1 }} /> Unsubscribe
          </MenuItem>
        ) : (
          <MenuItem onClick={handleResubscribe}>
            <CheckCircle fontSize="small" sx={{ mr: 1 }} /> Resubscribe
          </MenuItem>
        )}
        <MenuItem onClick={() => { setDeleteDialog(true); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Subscriber</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedSubscriber?.email}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            disabled={deleteLoading}
            color="error"
            variant="contained"
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
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

export default NewsletterSubscribers; 