'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('balances', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      userId: {
        references: {
          model: {
            tableName: 'users'
          },
          key: 'id'
        },
        allowNull: false,
        type: Sequelize.INTEGER
      },
      previous: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      book: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      current: {
        allowNull: false,
        type: Sequelize.DOUBLE
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
    await queryInterface.dropTable('balances');
  }
};