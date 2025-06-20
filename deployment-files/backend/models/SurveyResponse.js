// server/models/SurveyResponse.js
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