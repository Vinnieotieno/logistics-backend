// server/models/TeamMessage.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeamMessage = sequelize.define('TeamMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal'
  },
  department: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: null
  },
  senderId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'staff',
      key: 'id'
    },
    field: 'sender_id'
  },
  isEmailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_email_sent'
  },
  expiresAt: {
    type: DataTypes.DATE,
    field: 'expires_at'
  },
  attachments: {
    type: DataTypes.TEXT, // Store as JSON string
    allowNull: true
  }
}, {
  tableName: 'team_messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = TeamMessage;





