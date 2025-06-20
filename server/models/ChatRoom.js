// server/models/ChatRoom.js
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

// server/models/ChatMessage.js
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

// server/models/EmployeeSurvey.js
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