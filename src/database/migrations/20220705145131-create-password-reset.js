'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('passwordResets', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      token: {
        allowNull: false,
        type: Sequelize.STRING(200)
      },
      ip: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      device: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      status: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('passwordResets');
  }
};