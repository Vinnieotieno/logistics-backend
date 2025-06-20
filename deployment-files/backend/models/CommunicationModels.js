// server/models/CommunicationModels.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Staff = require('./Staff');

const TeamMessage = sequelize.define('TeamMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal'
  },
  department: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: null
  },
  senderId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'staff',
      key: 'id'
    },
    field: 'sender_id'
  },
  isEmailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_email_sent'
  },
  expiresAt: {
    type: DataTypes.DATE,
    field: 'expires_at'
  },
  attachments: {
    type: DataTypes.TEXT, // Store as JSON string
    allowNull: true
  }
}, {
  tableName: 'team_messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const ChatRoom = sequelize.define('ChatRoom', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  type: {
    type: DataTypes.ENUM('group', 'direct', 'department'),
    defaultValue: 'group'
  },
  department: {
    type: DataTypes.STRING
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'staff',
      key: 'id'
    },
    field: 'created_by'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'chat_rooms',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roomId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'chat_rooms',
      key: 'id'
    },
    onDelete: 'CASCADE',
    field: 'room_id'
  },
  senderId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'staff',
      key: 'id'
    },
    field: 'sender_id'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  messageType: {
    type: DataTypes.ENUM('text', 'image', 'file', 'system'),
    defaultValue: 'text',
    field: 'message_type'
  },
  fileUrl: {
    type: DataTypes.TEXT,
    field: 'file_url'
  },
  fileName: {
    type: DataTypes.STRING,
    field: 'file_name'
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_edited'
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_deleted'
  },
  replyToId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'chat_messages',
      key: 'id'
    },
    field: 'reply_to_id'
  }
}, {
  tableName: 'chat_messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const EmployeeSurvey = sequelize.define('EmployeeSurvey', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  anonymousOnly: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'anonymous_only'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'staff',
      key: 'id'
    },
    field: 'created_by'
  },
  closesAt: {
    type: DataTypes.DATE,
    field: 'closes_at'
  }
}, {
  tableName: 'employee_surveys',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const SurveyResponse = sequelize.define('SurveyResponse', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  surveyId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'employee_surveys',
      key: 'id'
    },
    onDelete: 'CASCADE',
    field: 'survey_id'
  },
  responseText: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'response_text'
  },
  category: {
    type: DataTypes.STRING
  },
  sentiment: {
    type: DataTypes.ENUM('positive', 'neutral', 'negative', 'suggestion', 'complaint')
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_anonymous'
  },
  staffId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'staff',
      key: 'id'
    },
    onDelete: 'SET NULL',
    field: 'staff_id'
  }
}, {
  tableName: 'survey_responses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const SurveyTemplate = sequelize.define('SurveyTemplate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  questions: {
    type: DataTypes.JSONB, // Array of question objects
    allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'staff',
      key: 'id'
    },
    field: 'created_by'
  }
}, {
  tableName: 'survey_templates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Export all models
module.exports = {
  TeamMessage,
  ChatRoom,
  ChatMessage,
  EmployeeSurvey,
  SurveyResponse,
  SurveyTemplate,
  Staff
};