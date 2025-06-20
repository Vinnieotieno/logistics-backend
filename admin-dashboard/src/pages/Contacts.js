// src/pages/Contacts.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Badge,
} from '@mui/material';
import {
  Search,
  Email,
  Phone,
  LocationOn,
  AccessTime,
  Reply,
  Delete,
  Archive,
  Star,
  StarBorder,
  MarkEmailRead,
  MarkEmailUnread,
  FilterList,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const GradientHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #388e3c 0%, #81c784 100%)',
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(56, 142, 60, 0.3)',
}));

const ContactCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  borderLeft: '4px solid transparent',
  '&:hover': {
    borderLeftColor: theme.palette.primary.main,
    transform: 'translateX(4px)',
    boxShadow: '0 4px 20px rgba(76, 175, 80, 0.15)',
  },
  '&.unread': {
    backgroundColor: '#f1f8e9',
    borderLeftColor: theme.palette.secondary.main,
  },
}));

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Contacts = () => {
  // UI state
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyDialog, setReplyDialog] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // Data state
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState([
    { label: 'Total Contacts', value: 0, color: 'primary' },
    { label: 'Unread', value: 0, color: 'secondary' },
    { label: 'Replied', value: 0, color: 'success' },
    { label: 'Pending', value: 0, color: 'warning' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 20 });

  // Fetch contacts and stats
  useEffect(() => {
    fetchContacts();
    fetchStats();
    // eslint-disable-next-line
  }, [selectedTab, search, page]);

  const fetchContacts = async () => {
    setLoading(true);
    setError('');
    try {
      let params = { page, limit, sortBy: 'createdAt', sortOrder: 'DESC' };
      if (search) params.search = search;
      if (selectedTab === 1) params.isRead = false;
      // Starred tab: filter locally for demo, backend should support isStarred if needed
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/contacts`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      let fetchedContacts = res.data.data.contacts;
      if (selectedTab === 2) {
        // Starred: filter locally (assuming isStarred property exists in backend)
        fetchedContacts = fetchedContacts.filter(c => c.isStarred);
      }
      setContacts(fetchedContacts);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError('Failed to fetch contacts');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/contacts/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const totals = res.data.data.totals;
      setStats([
        { label: 'Total Contacts', value: totals.total, color: 'primary' },
        { label: 'Unread', value: totals.unread, color: 'secondary' },
        { label: 'Replied', value: totals.replied, color: 'success' },
        { label: 'Pending', value: totals.total - totals.replied, color: 'warning' },
      ]);
    } catch (err) {
      // ignore stats error
    }
  };

  // Select contact and mark as read
  const handleSelectContact = async (contact) => {
    setSelectedContact(contact);
    if (!contact.isRead) {
      try {
        const token = localStorage.getItem('token');
        await axios.patch(`${API_BASE}/contacts/${contact.id}/toggle-read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchContacts();
        fetchStats();
      } catch (e) {}
    }
  };

  // Mark as read/unread
  const handleToggleRead = async (contact) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE}/contacts/${contact.id}/toggle-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchContacts();
      fetchStats();
      if (selectedContact && selectedContact.id === contact.id) {
        setSelectedContact({ ...selectedContact, isRead: !selectedContact.isRead });
      }
    } catch (e) {}
  };

  // Delete contact
  const handleDelete = async (contact) => {
    if (!window.confirm('Delete this contact inquiry?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/contacts/${contact.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedContact(null);
      fetchContacts();
      fetchStats();
    } catch (e) {}
  };

  // Reply to contact
  const handleReply = async () => {
    if (!replyMessage.trim()) return;
    setReplyLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/contacts/${selectedContact.id}/reply`, {
        replyMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReplyDialog(false);
      setReplyMessage('');
      fetchContacts();
      fetchStats();
    } catch (e) {
      alert('Failed to send reply');
    }
    setReplyLoading(false);
  };

  // Pagination controls
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Type colors (static)
  const typeColors = {
    inquiry: { bg: '#e3f2fd', color: '#1976d2' },
    business: { bg: '#f3e5f5', color: '#7b1fa2' },
    complaint: { bg: '#ffebee', color: '#d32f2f' },
    feedback: { bg: '#e8f5e9', color: '#388e3c' },
  };

  return (
    <Box>
      <GradientHeader>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Contact Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Manage inquiries, feedback, and customer communications
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              {stats.map((stat, index) => (
                <Grid item xs={6} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h5" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="caption">{stat.label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </GradientHeader>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5} lg={4}>
          <Paper elevation={0} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search contacts..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small">
                      <FilterList />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Paper>

          <Paper elevation={0}>
            <Tabs
              value={selectedTab}
              onChange={(e, newValue) => { setSelectedTab(newValue); setPage(1); }}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="All" />
              <Tab
                label={
                  <Badge badgeContent={stats[1]?.value || 0} color="error">
                    Unread
                  </Badge>
                }
              />
              <Tab label="Starred" />
            </Tabs>

            {loading ? (
              <Box p={2} textAlign="center"><Typography>Loading...</Typography></Box>
            ) : error ? (
              <Box p={2} textAlign="center"><Typography color="error">{error}</Typography></Box>
            ) : (
              <List sx={{ maxHeight: 'calc(100vh - 400px)', overflow: 'auto' }}>
                {contacts.length === 0 && (
                  <Box p={2} textAlign="center"><Typography>No contacts found.</Typography></Box>
                )}
                {contacts.map((contact, index) => (
                  <React.Fragment key={contact.id}>
                    <ListItem
                      alignItems="flex-start"
                      onClick={() => handleSelectContact(contact)}
                      sx={{
                        bgcolor: contact.isRead ? 'transparent' : 'action.hover',
                        '&:hover': { bgcolor: 'action.hover' },
                        cursor: 'pointer'
                      }}
                      selected={selectedContact && selectedContact.id === contact.id}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {contact.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography
                              variant="body2"
                              fontWeight={contact.isRead ? 400 : 600}
                            >
                              {contact.name}
                            </Typography>
                            {contact.type && (
                              <Chip
                                label={contact.type}
                                size="small"
                                sx={{
                                  backgroundColor: typeColors[contact.type]?.bg,
                                  color: typeColors[contact.type]?.color,
                                  height: 20,
                                  fontSize: '0.7rem',
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              fontWeight={contact.isRead ? 400 : 600}
                            >
                              {contact.subject}
                            </Typography>
                            <Typography
                              component="p"
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {contact.message}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box textAlign="right">
                          <IconButton size="small" edge="end">
                            {/* Starred logic: implement if backend supports */}
                            <StarBorder fontSize="small" />
                          </IconButton>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {contact.createdAt ? new Date(contact.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </Typography>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < contacts.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
            {/* Pagination controls */}
            <Box display="flex" justifyContent="center" alignItems="center" p={2}>
              <Button
                size="small"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >Prev</Button>
              <Typography variant="caption" mx={2}>
                Page {pagination.page} of {pagination.pages}
              </Typography>
              <Button
                size="small"
                disabled={pagination.page >= pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >Next</Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7} lg={8}>
          {selectedContact ? (
            <ContactCard elevation={0}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      {selectedContact.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {selectedContact.name}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Email fontSize="small" color="action" />
                          <Typography variant="body2">{selectedContact.email}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Phone fontSize="small" color="action" />
                          <Typography variant="body2">{selectedContact.phone}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  <Box display="flex" gap={1}>
                    <IconButton color="primary" onClick={() => handleToggleRead(selectedContact)}>
                      {selectedContact.isRead ? <MarkEmailUnread /> : <MarkEmailRead />}
                    </IconButton>
                    <IconButton>
                      <Archive />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(selectedContact)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50', mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">{selectedContact.subject}</Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {selectedContact.createdAt ? new Date(selectedContact.createdAt).toLocaleString() : ''}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" paragraph>
                    {selectedContact.message}
                  </Typography>
                </Paper>

                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<Reply />}
                    onClick={() => setReplyDialog(true)}
                    sx={{
                      background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
                    }}
                  >
                    Reply
                  </Button>
                  <Button variant="outlined" startIcon={<Email />}>
                    Forward
                  </Button>
                </Box>
              </CardContent>
            </ContactCard>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Email sx={{ fontSize: 80, color: 'primary.light', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Select a contact to view details
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Reply Dialog */}
      <Dialog open={replyDialog} onClose={() => setReplyDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Reply to {selectedContact?.name}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            placeholder="Type your reply..."
            value={replyMessage}
            onChange={e => setReplyMessage(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleReply}
            disabled={replyLoading || !replyMessage.trim()}
            sx={{
              background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
            }}
          >
            {replyLoading ? 'Sending...' : 'Send Reply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Contacts;