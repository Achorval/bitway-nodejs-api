'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auditLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'users'
          },
          key: 'id'
        },
        allowNull: false
      },
      request: {
        allowNull: true,
        type: Sequelize.JSON
      },
      response: {
        allowNull: true,
        type: Sequelize.JSON
      },
      url: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      device: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      channel: {
        allowNull: false,
        type: Sequelize.STRING(10)
      },
      ipAddress: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      action: {
        allowNull: false,
        type: Sequelize.STRING(50)
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
    await queryInterface.dropTable('auditLogs');
  }
};