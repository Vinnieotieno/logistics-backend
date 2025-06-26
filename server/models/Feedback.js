const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Feedback = sequelize.define('Feedback', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    feedbackType: {
      type: DataTypes.ENUM('positive', 'negative', 'suggestion', 'general'),
      defaultValue: 'general',
      allowNull: false
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    clientIP: {
      type: DataTypes.STRING(45), // IPv6 compatible
      allowNull: true
    },
    isProcessed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    processedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'staff',
        key: 'id'
      }
    }
  }, {
    tableName: 'feedback',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['rating']
      },
      {
        fields: ['feedbackType']
      },
      {
        fields: ['isProcessed']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['clientIP']
      }
    ]
  });

  Feedback.associate = (models) => {
    Feedback.belongsTo(models.Staff, {
      foreignKey: 'processedBy',
      as: 'processor'
    });
  };

  return Feedback;
}; 