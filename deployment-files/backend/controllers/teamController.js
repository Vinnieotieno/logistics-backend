// server/controllers/teamController.js
const { TeamMember, Staff } = require('../models');
const { Op } = require('sequelize');
const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;

// Get all staff grouped by department
const getTeamMembers = async (req, res) => {
  try {
    const { department, active } = req.query;
    const where = {};
    if (department) where.department = department;
    if (active !== undefined) where.isActive = active === 'true';

    const staffList = await Staff.findAll({
      where,
      attributes: {
        exclude: ['password']
      },
      order: [
        ['department', 'ASC'],
        ['fullName', 'ASC'],
        ['created_at', 'ASC']
      ]
    });

    // Group by department
    const grouped = {};
    staffList.forEach(staff => {
      const dept = staff.department || 'Other';
      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push(staff);
    });

    res.json({
      success: true,
      data: grouped,
      total: staffList.length
    });
  } catch (error) {
    console.error('GET TEAM MEMBERS ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff',
      error: error.message
    });
  }
};

// Get team member by ID
const getTeamMemberById = async (req, res) => {
  try {
    const teamMember = await TeamMember.findByPk(req.params.id, {
      include: [{
        model: Staff,
        as: 'staff',
        attributes: ['id', 'email', 'fullName', 'role']
      }]
    });

    if (!teamMember) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team member not found' 
      });
    }

    res.json({ success: true, data: teamMember });
  } catch (error) {
    console.error('Error fetching team member:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch team member' 
    });
  }
};

// Create team member
const createTeamMember = async (req, res) => {
  try {
    const {
      staffId,
      fullName,
      position,
      department,
      message,
      email,
      phone,
      socialLinkedin,
      socialTwitter,
      socialFacebook,
      socialInstagram,
      displayOrder
    } = req.body;

    // If staffId is provided, check if it exists in users table
    if (staffId) {
      const userExists = await Staff.findByPk(staffId);
      if (!userExists) {
        return res.status(400).json({
          success: false,
          message: `Staff ID ${staffId} does not exist in users table. Please select a valid staff user or leave blank.`
        });
      }
    }

    let avatarUrl = null;

    // Upload avatar if provided
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'team-members' });
        avatarUrl = result.secure_url;
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Cloudinary upload failed:', err);
        avatarUrl = req.file.path;
      }
    }

    const teamMember = await TeamMember.create({
      staffId: staffId || null,
      fullName,
      position,
      department,
      message,
      avatarUrl,
      email,
      phone,
      socialLinkedin,
      socialTwitter,
      socialFacebook,
      socialInstagram,
      displayOrder: displayOrder || 0
    });

    // Fetch with associations
    const newMember = await TeamMember.findByPk(teamMember.id, {
      include: [{
        model: Staff,
        as: 'staff',
        attributes: ['id', 'email', 'fullName', 'role']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      data: newMember
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create team member',
      error: error.message 
    });
  }
};

// Update team member
const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    const teamMember = await TeamMember.findByPk(id);
    if (!teamMember) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team member not found' 
      });
    }

    // Check if user is updating their own profile or is admin
    const isOwnProfile = teamMember.staffId === req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
    
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only update your own profile' 
      });
    }

    // Handle avatar upload
    if (req.file) {
      try {
        // Delete old avatar from Cloudinary if exists
        if (teamMember.avatarUrl) {
          const publicId = teamMember.avatarUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`team-members/${publicId}`);
        }

        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'team-members' });
        updateData.avatarUrl = result.secure_url;
        
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Cloudinary upload failed:', err);
        updateData.avatarUrl = req.file.path;
      }
    }

    await teamMember.update(updateData);

    const updatedMember = await TeamMember.findByPk(id, {
      include: [{
        model: Staff,
        as: 'staff',
        attributes: ['id', 'email', 'fullName', 'role']
      }]
    });

    res.json({
      success: true,
      message: 'Team member updated successfully',
      data: updatedMember
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update team member',
      error: error.message 
    });
  }
};

// Delete team member
const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    
    const teamMember = await TeamMember.findByPk(id);
    if (!teamMember) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team member not found' 
      });
    }

    // Delete avatar from Cloudinary if exists
    if (teamMember.avatarUrl) {
      try {
        const publicId = teamMember.avatarUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`team-members/${publicId}`);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    await teamMember.destroy();

    res.json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete team member' 
    });
  }
};

// Get my team profile
const getMyProfile = async (req, res) => {
  try {
    const teamMember = await TeamMember.findOne({
      where: { staffId: req.user.id },
      include: [{
        model: Staff,
        as: 'staff',
        attributes: ['id', 'email', 'fullName', 'role']
      }]
    });

    // Instead of 404, return success: true and data: null
    if (!teamMember) {
      return res.json({ 
        success: true, 
        data: null,
        message: 'No team profile found for this user'
      });
    }

    res.json({ success: true, data: teamMember });
  } catch (error) {
    console.error('Error fetching team profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch team profile' 
    });
  }
};

// Update display order for team members
const updateDisplayOrder = async (req, res) => {
  try {
    const { orders } = req.body; // Array of { id, displayOrder }
    
    const updatePromises = orders.map(({ id, displayOrder }) => 
      TeamMember.update({ displayOrder }, { where: { id } })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Display order updated successfully'
    });
  } catch (error) {
    console.error('Error updating display order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update display order' 
    });
  }
};

module.exports = {
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getMyProfile,
  updateDisplayOrder
};