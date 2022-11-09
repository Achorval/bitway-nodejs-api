'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BankAccount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      BankAccount.belongsTo(models.user);

      BankAccount.hasOne(models.transaction);
    }
  }
  BankAccount.init({
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
    bankName: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    bankCode: {
      allowNull: false,
      type: DataTypes.STRING(20)
    },
    accountNumber: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    accountName: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    status: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN
    }
  }, {
    sequelize,
    modelName: 'bankAccount',
  });
  return BankAccount;
};