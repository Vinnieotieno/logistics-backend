import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Alert
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'staff',
    department: '',
    phone: '',
    isActive: true
  });
  const [selectedId, setSelectedId] = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL || '/admin/api'}/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffList(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenDialog = (staff = null) => {
    if (staff) {
      setEditMode(true);
      setSelectedId(staff.id);
      setForm({
        email: staff.email,
        password: '',
        fullName: staff.fullName,
        role: staff.role,
        department: staff.department || '',
        phone: staff.phone || '',
        isActive: staff.isActive
      });
    } else {
      setEditMode(false);
      setSelectedId(null);
      setForm({
        email: '',
        password: '',
        fullName: '',
        role: 'staff',
        department: '',
        phone: '',
        isActive: true
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setForm({
      email: '',
      password: '',
      fullName: '',
      role: 'staff',
      department: '',
      phone: '',
      isActive: true
    });
    setSelectedId(null);
    setEditMode(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (editMode) {
        await axios.put(`${process.env.REACT_APP_API_URL || '/admin/api'}/staff/${selectedId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL || '/admin/api'}/staff`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      handleCloseDialog();
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save staff');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this staff member?')) return;
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL || '/admin/api'}/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete staff');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Staff Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add Staff
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
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
              {staffList.map(staff => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.fullName}</TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell>{staff.department}</TableCell>
                  <TableCell>{staff.phone}</TableCell>
                  <TableCell>{staff.isActive ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(staff)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(staff.id)} color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="normal"
            label="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="normal"
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="normal"
            label="Department"
            name="department"
            value={form.department}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="normal"
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="normal"
            label="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            fullWidth
            helperText={editMode ? 'Leave blank to keep current password' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editMode ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Staff; 