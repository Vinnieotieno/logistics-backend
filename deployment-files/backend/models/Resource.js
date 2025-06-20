const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Resource = sequelize.define('Resource', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  fileUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'file_url'
  },
  fileType: {
    type: DataTypes.STRING(50),
    field: 'file_type'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    field: 'file_size'
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'download_count'
  },
  category: {
    type: DataTypes.STRING(100)
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_published'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'resources',
  underscored: true
});

module.exports = Resource;