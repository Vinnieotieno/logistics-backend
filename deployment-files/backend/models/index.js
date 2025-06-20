// server/models/index.js - Updated version
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const Service = require('./Service');
const Blog = require('./Blog');
const BlogCategory = require('./BlogCategory');
const BlogComment = require('./BlogComment');
const BlogLike = require('./BlogLike');
const NewsletterSubscription = require('./NewsletterSubscription');
const Shipment = require('./Shipment');
const TrackingUpdate = require('./TrackingUpdate');
const Contact = require('./Contact');
const Job = require('./Job');
const JobApplication = require('./JobApplication');
const Testimonial = require('./Testimonial');
const LegalPage = require('./LegalPage');
const Resource = require('./Resource');
const TeamMember = require('./TeamMember');
const { TeamMessage, ChatRoom, ChatMessage, EmployeeSurvey, SurveyResponse } = require('./CommunicationModels');
const Staff = require('./Staff');

// Additional models for relationships
const MessageRead = sequelize.define('MessageRead', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  messageId: {
    type: Sequelize.INTEGER,
    field: 'message_id'
  },
  staffId: {
    type: Sequelize.INTEGER,
    field: 'staff_id'
  },
  readAt: {
    type: Sequelize.DATE,
    field: 'read_at',
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'message_reads',
  timestamps: false
});

const ChatRoomMember = sequelize.define('ChatRoomMember', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roomId: {
    type: Sequelize.INTEGER,
    field: 'room_id'
  },
  staffId: {
    type: Sequelize.INTEGER,
    field: 'staff_id'
  },
  joinedAt: {
    type: Sequelize.DATE,
    field: 'joined_at',
    defaultValue: Sequelize.NOW
  },
  lastReadAt: {
    type: Sequelize.DATE,
    field: 'last_read_at'
  },
  isAdmin: {
    type: Sequelize.BOOLEAN,
    field: 'is_admin',
    defaultValue: false
  }
}, {
  tableName: 'chat_room_members',
  timestamps: false
});

// Define associations
const defineAssociations = () => {
  // Existing associations
  User.hasMany(Service, { foreignKey: 'createdBy', as: 'services' });
  User.hasMany(Blog, { foreignKey: 'authorId', as: 'blogs' });
  User.hasMany(Shipment, { foreignKey: 'createdBy', as: 'shipments' });
  User.hasMany(TrackingUpdate, { foreignKey: 'updatedBy', as: 'trackingUpdates' });
  User.hasMany(Job, { foreignKey: 'createdBy', as: 'jobs' });

  Service.belongsTo(User, { foreignKey: 'createdBy', as: 'serviceCreator' });

  Blog.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
  Blog.belongsTo(BlogCategory, { foreignKey: 'categoryId', as: 'category' });
  Blog.hasMany(BlogComment, { foreignKey: 'blogId', as: 'comments' });
  Blog.hasMany(BlogLike, { foreignKey: 'blogId', as: 'likes' });

  BlogCategory.hasMany(Blog, { foreignKey: 'categoryId', as: 'blogs' });
  BlogComment.belongsTo(Blog, { foreignKey: 'blogId', as: 'blog' });
  BlogLike.belongsTo(Blog, { foreignKey: 'blogId', as: 'blog' });
  BlogLike.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  Shipment.belongsTo(User, { foreignKey: 'createdBy', as: 'shipmentCreator' });
  Shipment.hasMany(TrackingUpdate, { foreignKey: 'shipmentId', as: 'updates' });
  TrackingUpdate.belongsTo(Shipment, { foreignKey: 'shipmentId', as: 'shipment' });
  TrackingUpdate.belongsTo(User, { foreignKey: 'updatedBy', as: 'updatedByUser' });

  Job.belongsTo(User, { foreignKey: 'createdBy', as: 'jobCreator' });
  Job.hasMany(JobApplication, { foreignKey: 'jobId', as: 'applications' });
  JobApplication.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

  // New associations for Team and Communication
  
  // Team Member associations
  TeamMember.belongsTo(Staff, { foreignKey: 'staffId', as: 'staff' });
  Staff.hasOne(TeamMember, { foreignKey: 'staffId', as: 'teamProfile' });

  // Team Message associations
  TeamMessage.belongsTo(Staff, { foreignKey: 'senderId', as: 'sender' });
  TeamMessage.belongsToMany(Staff, {
    through: MessageRead,
    foreignKey: 'messageId',
    otherKey: 'staffId',
    as: 'readers'
  });
  Staff.belongsToMany(TeamMessage, {
    through: MessageRead,
    foreignKey: 'staffId',
    otherKey: 'messageId',
    as: 'readMessages'
  });

  // Chat Room associations
  ChatRoom.belongsTo(Staff, { foreignKey: 'createdBy', as: 'creator' });
  ChatRoom.belongsToMany(Staff, {
    through: ChatRoomMember,
    foreignKey: 'roomId',
    otherKey: 'staffId',
    as: 'members'
  });
  Staff.belongsToMany(ChatRoom, {
    through: ChatRoomMember,
    foreignKey: 'staffId',
    otherKey: 'roomId',
    as: 'chatRooms'
  });

  // Chat Message associations
  ChatMessage.belongsTo(ChatRoom, { foreignKey: 'roomId', as: 'room' });
  ChatMessage.belongsTo(Staff, { foreignKey: 'senderId', as: 'sender' });
  ChatMessage.belongsTo(ChatMessage, { foreignKey: 'replyToId', as: 'replyTo' });
  ChatMessage.hasMany(ChatMessage, { foreignKey: 'replyToId', as: 'replies' });
  
  ChatRoom.hasMany(ChatMessage, { foreignKey: 'roomId', as: 'messages' });
  Staff.hasMany(ChatMessage, { foreignKey: 'senderId', as: 'sentMessages' });

  // Survey associations
  EmployeeSurvey.belongsTo(Staff, { foreignKey: 'createdBy', as: 'creator' });
  EmployeeSurvey.hasMany(SurveyResponse, { foreignKey: 'surveyId', as: 'responses' });
  
  SurveyResponse.belongsTo(EmployeeSurvey, { foreignKey: 'surveyId', as: 'survey' });
  SurveyResponse.belongsTo(Staff, { foreignKey: 'staffId', as: 'respondent' });
};

// Initialize associations
defineAssociations();

module.exports = {
  sequelize,
  User,
  Staff,
  Service,
  Blog,
  BlogCategory,
  BlogComment,
  BlogLike,
  NewsletterSubscription,
  Shipment,
  TrackingUpdate,
  Contact,
  Job,
  JobApplication,
  Testimonial,
  LegalPage,
  Resource,
  TeamMember,
  TeamMessage,
  ChatRoom,
  ChatMessage,
  EmployeeSurvey,
  SurveyResponse,
  MessageRead,
  ChatRoomMember
};