const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Blog = sequelize.define('Blog', {
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
  content: {
    type: DataTypes.TEXT
  },
  featuredImage: {
    type: DataTypes.TEXT,
    field: 'featured_image'
  },
  authorId: {
    type: DataTypes.INTEGER,
    field: 'author_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  categoryId: {
    type: DataTypes.INTEGER,
    field: 'category_id',
    references: {
      model: 'blog_categories',
      key: 'id'
    }
  },
  readTime: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    field: 'read_time'
  },
  likesCount: {
    type: DataTypes.INTEGER,
    field: 'likes_count',
    defaultValue: 0
  },
  viewsCount: {
    type: DataTypes.INTEGER,
    field: 'views_count',
    defaultValue: 0
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    field: 'is_published',
    defaultValue: false
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured'
  },
  metaTitle: {
    type: DataTypes.STRING,
    field: 'meta_title'
  },
  metaDescription: {
    type: DataTypes.TEXT,
    field: 'meta_description'
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  publishedAt: {
    type: DataTypes.DATE,
    field: 'published_at'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  }
}, {
  tableName: 'blogs',
  underscored: true
});

// No associations here, only model definition
module.exports = Blog;