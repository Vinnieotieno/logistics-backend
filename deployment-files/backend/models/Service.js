const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
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
  shortDescription: {
    type: DataTypes.TEXT,
    field: 'short_description'
  },
  description: {
    type: DataTypes.TEXT
  },
  keyBenefits: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    field: 'key_benefits',
    defaultValue: []
  },
  imageUrl: {
    type: DataTypes.TEXT,
    field: 'image_url'
  },
  galleryUrls: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    field: 'gallery_urls',
    defaultValue: []
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    field: 'is_published',
    defaultValue: false
  },
  metaTitle: {
    type: DataTypes.STRING,
    field: 'meta_title'
  },
  metaDescription: {
    type: DataTypes.TEXT,
    field: 'meta_description'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  },
  faq: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'services',
  underscored: true
});

// No associations here, only model definition
module.exports = Service;