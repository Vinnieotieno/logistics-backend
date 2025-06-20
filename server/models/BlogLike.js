const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BlogLike = sequelize.define('BlogLike', {
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
  ipAddress: {
    type: DataTypes.INET,
    field: 'ip_address'
  },
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'blog_likes',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['blog_id', 'ip_address']
    }
  ]
});

module.exports = BlogLike;