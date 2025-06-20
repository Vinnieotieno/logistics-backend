const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Register (only superadmin can create staff)
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, fullName, role, department, phone } = req.body;

    const existingStaff = await Staff.findOne({ where: { email } });
    if (existingStaff) {
      return res.status(400).json({ message: 'Staff already exists' });
    }

    const staff = await Staff.create({
      email,
      password,
      fullName,
      role: req.user?.role === 'superadmin' ? role : 'staff',
      department,
      phone
    });

    const token = generateToken(staff.id);

    res.status(201).json({
      success: true,
      token,
      staff: {
        id: staff.id,
        email: staff.email,
        fullName: staff.fullName,
        role: staff.role,
        department: staff.department,
        phone: staff.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Try user first
    let user = await User.findOne({ where: { email } });
    let isStaff = false;
    let userType = 'user';
    if (!user) {
      user = await Staff.findOne({ where: { email } });
      isStaff = !!user;
      userType = 'staff';
    }
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Issue JWT
    const token = generateToken(user.id);
    // Return user info (with role)
    res.json({
      success: true,
      token,
      [userType]: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        department: user.department,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        isStaff: userType === 'staff'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    // Try user first
    let user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    let userType = 'user';
    if (!user) {
      user = await Staff.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
      userType = 'staff';
    }
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, [userType]: user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Profile (allow staff to edit their own profile)
const updateProfile = async (req, res) => {
  try {
    const { fullName, email, department, phone } = req.body;

    const staff = await Staff.findByPk(req.user.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    staff.fullName = fullName || staff.fullName;
    staff.email = email || staff.email;
    staff.department = department || staff.department;
    staff.phone = phone || staff.phone;
    await staff.save();

    res.json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const staff = await Staff.findByPk(req.user.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const isMatch = await staff.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    staff.password = newPassword;
    await staff.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Logout (Dummy if you're using JWT)
const logout = async (req, res) => {
  try {
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Refresh Token (Optional example logic)
const refreshToken = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.user?.id || req.body?.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const token = generateToken(staff.id);

    res.json({
      success: true,
      token,
      staff: {
        id: staff.id,
        email: staff.email,
        fullName: staff.fullName,
        role: staff.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  refreshToken
};
