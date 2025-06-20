'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('staff', 'avatar_url', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('staff', 'message', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('staff', 'social_linkedin', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('staff', 'social_twitter', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('staff', 'social_facebook', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('staff', 'social_instagram', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('staff', 'avatar_url');
    await queryInterface.removeColumn('staff', 'message');
    await queryInterface.removeColumn('staff', 'social_linkedin');
    await queryInterface.removeColumn('staff', 'social_twitter');
    await queryInterface.removeColumn('staff', 'social_facebook');
    await queryInterface.removeColumn('staff', 'social_instagram');
  }
};
