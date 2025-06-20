'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tracking_updates', 'latitude', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('tracking_updates', 'longitude', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tracking_updates', 'latitude');
    await queryInterface.removeColumn('tracking_updates', 'longitude');
  }
};
