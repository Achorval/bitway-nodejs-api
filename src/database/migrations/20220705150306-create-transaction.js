'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
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
      serviceId: {
        references: {
          model: {
            tableName: 'services'
          },
          key: 'id'
        },
        allowNull: false,
        type: Sequelize.INTEGER
      },
      reference: {
        allowNull: false,
        type: Sequelize.STRING
      },
      amount: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      balanceId: {
        references: {
          model: {
            tableName: 'balances'
          },
          key: 'id'
        },
        allowNull: true,
        type: Sequelize.INTEGER
      },
      bankAccountId: {
        references: {
          model: {
            tableName: 'bankAccounts'
          },
          key: 'id'
        },
        allowNull: true,
        type: Sequelize.INTEGER
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM("credit", "debit")
      },
      narration: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      imageUrl: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      completedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  }
};