const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BlogComment = sequelize.define('BlogComment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  blogId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'blog_id',
    references: {
      model: 'blogs',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true, // <-- Make email optional
    validate: {
      isEmail: true
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_approved'
  }
}, {
  tableName: 'blog_comments',
  underscored: true
});

module.exports = BlogComment;