'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('JobHistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      jobToken: {
        type: Sequelize.STRING
      },
      jobStatus: {
        type: Sequelize.ENUM('started', 'in_progress', 'successful', 'failed')
      },
      jobProjects: {
        type: Sequelize.JSON
      },
      jobMessage: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('JobHistories');
  }
};