const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(50)
  },
  subject: {
    type: DataTypes.STRING
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    field: 'is_read',
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  repliedAt: {
    type: DataTypes.DATE,
    field: 'replied_at'
  }
}, {
  tableName: 'contacts',
  underscored: true
});

module.exports = Contact;