'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transaction.belongsTo(models.user);

      Transaction.belongsTo(models.balance);

      Transaction.belongsTo(models.bankAccount);

      Transaction.belongsTo(models.service);
    }
  }
  Transaction.init({
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    userId: {
      references: {
        model: {
          tableName: 'users'
        },
        key: 'id'
      },
      allowNull: false,
      type: DataTypes.INTEGER
    },
    serviceId: {
      references: {
        model: {
          tableName: 'services'
        },
        key: 'id'
      },
      allowNull: false,
      type: DataTypes.INTEGER
    },
    reference: {
      allowNull: false,
      type: DataTypes.STRING
    },
    amount: {
      allowNull: false,
      type: DataTypes.DOUBLE
    },
    balanceId: {
      references: {
        model: {
          tableName: 'balances'
        },
        key: 'id'
      },
      allowNull: true,
      type: DataTypes.INTEGER
    },
    bankAccountId: {
      references: {
        model: {
          tableName: 'bankAccounts'
        },
        key: 'id'
      },
      allowNull: true,
      type: DataTypes.INTEGER
    },
    type: {
      allowNull: false,
      type: DataTypes.ENUM("credit", "debit")
    },
    narration: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    imageUrl: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    status: {
      allowNull: false,
      type: DataTypes.STRING
    },
    completedAt: {
      allowNull: true,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'transaction',
  });
  return Transaction;
};