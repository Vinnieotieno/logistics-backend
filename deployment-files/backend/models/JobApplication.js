const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JobApplication = sequelize.define('JobApplication', {
  
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'job_id',
    references: {
      model: 'jobs',
      key: 'id'
    }
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
  coverLetter: {
    type: DataTypes.TEXT,
    field: 'cover_letter'
  },
  resumeUrl: {
    type: DataTypes.TEXT,
    field: 'resume_url'
  },
  portfolioUrl: {
    type: DataTypes.TEXT,
    field: 'portfolio_url'
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  }
}, {
  tableName: 'job_applications',
  underscored: true
});

module.exports = JobApplication;