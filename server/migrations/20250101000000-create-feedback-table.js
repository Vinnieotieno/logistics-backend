'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('feedback', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      feedbackType: {
        type: Sequelize.ENUM('positive', 'negative', 'suggestion', 'general'),
        defaultValue: 'general',
        allowNull: false
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pageUrl: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      clientIP: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      isProcessed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      adminNotes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      processedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      processedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'staff',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('feedback', ['rating']);
    await queryInterface.addIndex('feedback', ['feedbackType']);
    await queryInterface.addIndex('feedback', ['isProcessed']);
    await queryInterface.addIndex('feedback', ['created_at']);
    await queryInterface.addIndex('feedback', ['clientIP']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('feedback');
  }
}; 