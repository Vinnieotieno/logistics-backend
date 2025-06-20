const User = require('../models/User'); // Use User model
const { validationResult } = require('express-validator');
const { Op, sequelize } = require('sequelize'); // Add sequelize for stats
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');
const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;

// Get all users with filtering and pagination
const getUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      role, 
      isActive,
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Filter by role
    if (role) {
      whereClause.role = role;
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users', 
      error: error.message 
    });
  }
};

// Get single user
const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user', 
      error: error.message 
    });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password, fullName, role, isActive, department, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    const user = await User.create({
      email,
      password,
      fullName,
      role: role || 'user',
      isActive: isActive !== undefined ? isActive : true,
      department,
      phone
    });

    // Send welcome email
    await sendEmail({
      to: user.email,
      template: 'staff-welcome',
      data: {
        name: user.fullName,
        department: user.department,
        role: user.role,
        email: user.email
      }
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        department: user.department,
        phone: user.phone,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating user', 
      error: error.message 
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const { email, fullName, role, isActive, department, phone } = req.body;

    // Check if email is being changed and already exists
    if (email !== user.email) {
      const existingUser = await User.findOne({ 
        where: { 
          email, 
          id: { [Op.ne]: id } 
        } 
      });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already in use by another user' 
        });
      }
    }

    await user.update({
      email,
      fullName,
      role: role !== undefined ? role : user.role,
      isActive: isActive !== undefined ? isActive : user.isActive,
      department,
      phone
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        department: user.department,
        phone: user.phone,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user', 
      error: error.message 
    });
  }
};

// Toggle user active status
const toggleActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    await user.update({ isActive: !user.isActive });

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: user.isActive }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error toggling user status', 
      error: error.message 
    });
  }
};

// Reset user password
const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    await user.update({ password: tempPassword });

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: { 
        tempPassword,
        message: 'Temporary password generated. Please ask user to change it immediately.'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error resetting password', 
      error: error.message 
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    await user.destroy();
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user', 
      error: error.message 
    });
  }
};

// Update user avatar
const updateAvatar = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No avatar file provided' 
      });
    }
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    let avatarUrl = null;
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'users' });
        avatarUrl = result.secure_url;
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Cloudinary upload failed:', err);
        avatarUrl = req.file.path;
      }
    }
    await user.update({ avatarUrl });
    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: { avatarUrl: user.avatarUrl }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating avatar', 
      error: error.message 
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const inactiveUsers = await User.count({ where: { isActive: false } });

    // Role distribution
    const roleDistribution = await User.findAll({
      attributes: [
        'role',
        [User.sequelize.fn('COUNT', User.sequelize.col('role')), 'count']
      ],
      group: ['role'],
      order: [[User.sequelize.fn('COUNT', User.sequelize.col('role')), 'DESC']]
    });

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await User.count({
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
    });

    res.json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        recentRegistrations,
        roleDistribution: roleDistribution.map(item => ({
          role: item.role,
          count: parseInt(item.dataValues.count)
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user statistics', 
      error: error.message 
    });
  }
};

// Get team members
const getTeamMembers = async () => {
  // Only return public info for team section
  const users = await User.findAll({
    where: { isActive: true },
    attributes: ['id', 'fullName', 'email', 'department', 'role', 'avatarUrl', 'phone']
  });
  return users;
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  toggleActiveStatus,
  resetPassword,
  deleteUser,
  updateAvatar,
  getUserStats,
  getTeamMembers,
};