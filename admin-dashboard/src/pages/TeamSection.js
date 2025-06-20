// pages/TeamSection.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Chip,
  Fab,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Stack,
  Tooltip,
  Badge,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LinkedIn,
  Twitter,
  Facebook,
  Instagram,
  Email,
  Phone,
  Business,
  Person,
  PhotoCamera,
  Save,
  Cancel,
  Group,
  AccountTree
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  borderRadius: '16px',
  overflow: 'hidden',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 40px rgba(134, 197, 23, 0.15)',
  },
}));

const DepartmentHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: 'linear-gradient(135deg, #86c517 0%, #68a80d 100%)',
  color: 'white',
  borderRadius: '16px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
    animation: 'shimmer 3s ease-in-out infinite',
  },
  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' }
  }
}));

const departments = [
  { value: 'managing_director', label: 'Managing Director', icon: <AccountTree /> },
  { value: 'management', label: 'Management', icon: <Business /> },
  { value: 'accounts', label: 'Accounts Department', icon: <Business /> },
  { value: 'hr', label: 'HR Department', icon: <Group /> },
  { value: 'sales', label: 'Sales Department', icon: <Business /> },
  { value: 'customer_service', label: 'Customer Service', icon: <Business /> },
  { value: 'it', label: 'IT Department', icon: <Business /> },
  { value: 'marketing_communication', label: 'Marketing & Communication', icon: <Business /> },
  { value: 'operations', label: 'Operations Department', icon: <Business /> }
];

const TeamSection = () => {
  const [teamMembers, setTeamMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    position: '',
    department: '',
    message: '',
    email: '',
    phone: '',
    socialLinkedin: '',
    socialTwitter: '',
    socialFacebook: '',
    socialInstagram: '',
    avatarUrl: '',
    password: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'

  let user = null;
  let isAdmin = false;
  try {
    user = JSON.parse(localStorage.getItem('user'));
    isAdmin = user && typeof user.role === 'string' && ['admin', 'superadmin'].includes(user.role.toLowerCase());
  } catch (e) {
    user = null;
    isAdmin = false;
  }

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  if (!user) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h5" color="error">
            User not found. Please log in again.
          </Typography>
        </Box>
      </Container>
    );
  }

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/team/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeamMembers(response.data.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (member = null) => {
    if (member) {
      setEditMode(true);
      setSelectedMember(member);
      setFormData({
        fullName: member.fullName,
        position: member.position,
        department: member.department,
        message: member.message || '',
        email: member.email || '',
        phone: member.phone || '',
        socialLinkedin: member.socialLinkedin || '',
        socialTwitter: member.socialTwitter || '',
        socialFacebook: member.socialFacebook || '',
        socialInstagram: member.socialInstagram || '',
        avatarUrl: member.avatarUrl || '',
        password: ''
      });
      setAvatarPreview(member.avatarUrl);
    } else {
      setEditMode(false);
      setSelectedMember(null);
      setFormData({
        fullName: '',
        position: '',
        department: '',
        message: '',
        email: '',
        phone: '',
        socialLinkedin: '',
        socialTwitter: '',
        socialFacebook: '',
        socialInstagram: '',
        avatarUrl: '',
        password: ''
      });
      setAvatarPreview(null);
    }
    setAvatarFile(null);
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedMember(null);
    setFormData({
      fullName: '',
      position: '',
      department: '',
      message: '',
      email: '',
      phone: '',
      socialLinkedin: '',
      socialTwitter: '',
      socialFacebook: '',
      socialInstagram: '',
      avatarUrl: '',
      password: ''
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!editMode && !formData.password) newErrors.password = 'Password is required';
    if (!formData.position) newErrors.position = 'Position is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'password' && editMode && !formData.password) return;
      if (formData[key]) submitData.append(key, formData[key]);
    });
    if (avatarFile) submitData.append('avatar', avatarFile);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      if (editMode) {
        await axios.put(`/api/staff/${selectedMember.id}`, submitData, config);
        setSuccessMessage('Staff member updated successfully');
      } else {
        await axios.post('/api/staff', submitData, config);
        setSuccessMessage('Staff member added successfully');
      }
      fetchTeamMembers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving staff member:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to save staff member' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('Staff member deleted successfully');
      fetchTeamMembers();
    } catch (error) {
      console.error('Error deleting staff member:', error);
    }
  };

  const renderTeamMember = (member) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={member.id}>
      <StyledCard>
        <CardMedia
          component="div"
          sx={{
            height: 280,
            backgroundImage: `url(${member.avatarUrl || '/api/placeholder/400/400'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}
        >
          {(isAdmin || member.staffId === user?.id) && (
            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
              <IconButton
                size="small"
                onClick={() => handleOpenDialog(member)}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': { backgroundColor: 'white' }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              {isAdmin && (
                <IconButton
                  size="small"
                  onClick={() => handleDelete(member.id)}
                  sx={{
                    ml: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { backgroundColor: 'white' }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          )}
        </CardMedia>
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#2d3748' }}>
            {member.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {member.position}
          </Typography>
          {member.message && (
            <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
              "{member.message}"
            </Typography>
          )}
          <Box sx={{ mt: 2 }}>
            {member.email && (
              <Chip
                icon={<Email />}
                label={member.email}
                size="small"
                sx={{ m: 0.5 }}
                onClick={() => window.location.href = `mailto:${member.email}`}
              />
            )}
            {member.phone && (
              <Chip
                icon={<Phone />}
                label={member.phone}
                size="small"
                sx={{ m: 0.5 }}
                onClick={() => window.location.href = `tel:${member.phone}`}
              />
            )}
          </Box>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            {member.socialLinkedin && (
              <IconButton
                size="small"
                href={member.socialLinkedin}
                target="_blank"
                sx={{ color: '#0077b5' }}
              >
                <LinkedIn />
              </IconButton>
            )}
            {member.socialTwitter && (
              <IconButton
                size="small"
                href={member.socialTwitter}
                target="_blank"
                sx={{ color: '#1da1f2' }}
              >
                <Twitter />
              </IconButton>
            )}
            {member.socialFacebook && (
              <IconButton
                size="small"
                href={member.socialFacebook}
                target="_blank"
                sx={{ color: '#1877f2' }}
              >
                <Facebook />
              </IconButton>
            )}
            {member.socialInstagram && (
              <IconButton
                size="small"
                href={member.socialInstagram}
                target="_blank"
                sx={{ color: '#e4405f' }}
              >
                <Instagram />
              </IconButton>
            )}
          </Stack>
        </CardContent>
      </StyledCard>
    </Grid>
  );
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: '#2d3748' }}>
            Team
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage your staff and team profiles in one place
          </Typography>
        </Box>
        {isAdmin && (
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              background: 'linear-gradient(135deg, #86c517 0%, #68a80d 100%)',
              zIndex: 2000
            }}
            onClick={() => handleOpenDialog()}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>
      <Tabs
        value={viewMode}
        onChange={(e, v) => setViewMode(v)}
        sx={{ mb: 4 }}
      >
        <Tab value="card" label="Team Card View" />
        <Tab value="table" label="Admin Table View" />
      </Tabs>
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        viewMode === 'card' ? (
          <Box>
            {/* Card View (existing code) */}
            {activeTab === 0 ? (
              Object.entries(teamMembers).map(([deptName, members]) => (
                <Box key={deptName} sx={{ mb: 6 }}>
                  <DepartmentHeader elevation={0}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {deptName}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      {members.length} team member{members.length !== 1 ? 's' : ''}
                    </Typography>
                  </DepartmentHeader>
                  <Grid container spacing={3}>
                    {members.map(renderTeamMember)}
                  </Grid>
                </Box>
              ))
            ) : (
              <Grid container spacing={3}>
                {(() => {
                  const selectedDept = departments[activeTab - 1];
                  const deptMembers = Object.entries(teamMembers).find(
                    ([name]) => name === selectedDept.label
                  )?.[1] || [];
                  if (deptMembers.length === 0) {
                    return (
                      <Grid item xs={12}>
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                          <Typography variant="h6" color="text.secondary">
                            No team members in this department yet
                          </Typography>
                        </Paper>
                      </Grid>
                    );
                  }
                  return deptMembers.map(renderTeamMember);
                })()}
              </Grid>
            )}
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.values(teamMembers).flat().map(staff => (
                  <TableRow key={staff.id}>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>{staff.fullName}</TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell>{staff.department}</TableCell>
                    <TableCell>{staff.phone}</TableCell>
                    <TableCell>{staff.isActive ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(staff)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(staff.id)} color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}
      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {editMode ? 'Edit Team Member' : 'Add New Team Member'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Avatar Upload */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton
                    component="label"
                    sx={{
                      backgroundColor: '#86c517',
                      color: 'white',
                      '&:hover': { backgroundColor: '#68a80d' }
                    }}
                  >
                    <PhotoCamera />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </IconButton>
                }
              >
                <Avatar
                  src={avatarPreview}
                  sx={{ width: 120, height: 120 }}
                />
              </Badge>
              <Box sx={{ ml: 3 }}>
                <Typography variant="h6">Profile Photo</Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload a professional photo (recommended: 400x400px)
                </Typography>
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  error={!!errors.position}
                  helperText={errors.position}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.department}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    label="Department"
                  >
                    {departments.map(dept => (
                      <MenuItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Personal Message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  helperText="A brief message or quote"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Chip label="Social Media (Optional)" />
                </Divider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="LinkedIn URL"
                  name="socialLinkedin"
                  value={formData.socialLinkedin}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <LinkedIn sx={{ mr: 1, color: '#0077b5' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Twitter URL"
                  name="socialTwitter"
                  value={formData.socialTwitter}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <Twitter sx={{ mr: 1, color: '#1da1f2' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Facebook URL"
                  name="socialFacebook"
                  value={formData.socialFacebook}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <Facebook sx={{ mr: 1, color: '#1877f2' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Instagram URL"
                  name="socialInstagram"
                  value={formData.socialInstagram}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <Instagram sx={{ mr: 1, color: '#e4405f' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={!!errors.password}
                  helperText={editMode ? 'Leave blank to keep current password' : errors.password}
                  required={!editMode}
                />
              </Grid>
            </Grid>
            {errors.submit && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.submit}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCloseDialog}
            startIcon={<Cancel />}
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<Save />}
            sx={{
              background: 'linear-gradient(135deg, #86c517 0%, #68a80d 100%)',
              borderRadius: '8px'
            }}
          >
            {editMode ? 'Update' : 'Add'} Team Member
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
export default TeamSection;