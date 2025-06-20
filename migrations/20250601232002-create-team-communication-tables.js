Sequelize CLI [Node: 18.19.1, CLI: 6.6.3, ORM: 6.37.7]

Loaded configuration file "server/config/config.js".
Using environment "development".
== 20250601232002-create-team-communication-tables: migrating =======
== 20250601232002-create-team-communication-tables: migrated (0.120s)

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('team_messages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      priority: {
        type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
        defaultValue: 'normal'
      },
      department: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      },
      sender_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'staff',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      is_email_sent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      attachments: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('team_messages');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_team_messages_priority";');
  }
};
