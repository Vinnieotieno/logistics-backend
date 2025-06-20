const { Staff } = require('../models');
const bcrypt = require('bcryptjs');

// List all staff
const listStaff = async (req, res) => {
  try {
    const staff = await Staff.findAll({ attributes: { exclude: ['password'] } });
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch staff', error: error.message });
  }
};

// Get single staff
const getStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch staff', error: error.message });
  }
};

// Create staff
const createStaff = async (req, res) => {
  try {
    console.log('REQ.BODY:', req.body);
    const { email, password, fullName, role, department, phone, isActive } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Email, password, and full name are required' });
    }
    const existing = await Staff.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Staff with this email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const staff = await Staff.create({
      email,
      password: hashedPassword,
      fullName,
      role: role || 'staff',
      department,
      phone,
      isActive: isActive !== undefined ? isActive : true
    });
    res.status(201).json({ success: true, data: { ...staff.toJSON(), password: undefined } });
  } catch (error) {
    console.error('CREATE STAFF ERROR:', error);
    res.status(500).json({ success: false, message: 'Failed to create staff', error: error.message });
  }
};

// Update staff
const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    const { email, password, fullName, role, department, phone, isActive } = req.body;
    if (email) staff.email = email;
    if (fullName) staff.fullName = fullName;
    if (role) staff.role = role;
    if (department) staff.department = department;
    if (phone) staff.phone = phone;
    if (isActive !== undefined) staff.isActive = isActive;
    if (password) staff.password = await bcrypt.hash(password, 10);
    await staff.save();
    res.json({ success: true, data: { ...staff.toJSON(), password: undefined } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update staff', error: error.message });
  }
};

// Delete staff
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    await staff.destroy();
    res.json({ success: true, message: 'Staff deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete staff', error: error.message });
  }
};

module.exports = {
  listStaff,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff
};
