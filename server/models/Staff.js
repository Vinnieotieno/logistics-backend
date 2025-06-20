const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Staff = sequelize.define('Staff', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'full_name'
  },
  role: {
    type: DataTypes.ENUM('superadmin', 'admin', 'staff'),
    defaultValue: 'staff'
  },
  department: {
    type: DataTypes.STRING
  },
  phone: {
    type: DataTypes.STRING
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  avatarUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'avatar_url'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  socialLinkedin: {
    type: DataTypes.STRING,
    allowNull: true,
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
  lastLoginAt: {
    type: DataTypes.DATE,
    field: 'last_login_at'
  },
  emailVerifiedAt: {
    type: DataTypes.DATE,
    field: 'email_verified_at'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'staff',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Staff; 