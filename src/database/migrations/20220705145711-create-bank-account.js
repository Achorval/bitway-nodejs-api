'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bankAccounts', {
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
      bankName: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      bankCode: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      accountNumber: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      accountName: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      status: {
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.dropTable('bankAccounts');
  }
};