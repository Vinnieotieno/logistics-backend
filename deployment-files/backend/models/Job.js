const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
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
  department: {
    type: DataTypes.STRING
  },
  location: {
    type: DataTypes.STRING
  },
  jobType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship'),
    field: 'job_type'
  },
  description: {
    type: DataTypes.TEXT
  },
  requirements: {
    type: DataTypes.TEXT
  },
  responsibilities: {
    type: DataTypes.TEXT
  },
  salaryRange: {
    type: DataTypes.STRING(100),
    field: 'salary_range'
  },
  benefits: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
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
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  },
  applicationDeadline: {
    type: DataTypes.DATE,
    field: 'application_deadline'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isClosed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_closed'
  }
}, {
  tableName: 'jobs',
  underscored: true
});

// No associations here, only model definition
module.exports = Job;
