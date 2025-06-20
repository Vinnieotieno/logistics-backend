const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Testimonial = sequelize.define('Testimonial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  position: {
    type: DataTypes.STRING
  },
  company: {
    type: DataTypes.STRING
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  avatarUrl: {
    type: DataTypes.TEXT,
    field: 'avatar_url'
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: {
      min: 1,
      max: 5
    }
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    field: 'is_published',
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  improvement: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  consent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'testimonials',
  underscored: true
});

module.exports = Testimonial;