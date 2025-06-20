const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LegalPage = sequelize.define('LegalPage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_published'
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    field: 'updated_by',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'legal_pages',
  underscored: true
});

module.exports = LegalPage;