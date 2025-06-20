const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NewsletterSubscription = sequelize.define('NewsletterSubscription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  subscribedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'subscribed_at'
  },
  unsubscribedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'unsubscribed_at'
  }
}, {
  tableName: 'newsletter_subscriptions',
  underscored: true,
  timestamps: false
});

module.exports = NewsletterSubscription;