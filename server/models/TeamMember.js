// server/models/TeamMember.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeamMember = sequelize.define('TeamMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  staffId: {
    type: DataTypes.INTEGER,
    allowNull: true, // <-- Make staffId optional
    references: {
      model: 'staff',
      key: 'id'
    },
    onDelete: 'CASCADE',
    field: 'staff_id' // <-- Fix: map to DB column
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'full_name'
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.ENUM(
      'managing_director',
      'management',
      'accounts',
      'hr',
      'sales',
      'customer_service',
      'it',
      'marketing_communication',
      'operations'
    ),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true // <-- Make message optional
  },
  avatarUrl: {
    type: DataTypes.TEXT,
    field: 'avatar_url'
  },
  email: {
    type: DataTypes.STRING
  },
  phone: {
    type: DataTypes.STRING
  },
  socialLinkedin: {
    type: DataTypes.STRING,
    allowNull: true, // <-- Make social links optional
    field: 'social_linkedin'
  },
  socialTwitter: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'social_twitter'
  },
  socialFacebook: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'social_facebook'
  },
  socialInstagram: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'social_instagram'
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'display_order'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'team_members',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Class methods
TeamMember.getDepartmentLabel = (department) => {
  const labels = {
    'managing_director': 'Managing Director',
    'management': 'Management',
    'accounts': 'Accounts Department',
    'hr': 'HR Department',
    'sales': 'Sales Department',
    'customer_service': 'Customer Service Department',
    'it': 'IT Department',
    'marketing_communication': 'Marketing & Communication',
    'operations': 'Operations Department'
  };
  return labels[department] || department;
};

module.exports = TeamMember;