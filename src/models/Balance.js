'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Balance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Balance.belongsTo(models.user);

      Balance.hasOne(models.transaction);
    }
  }
  Balance.init({
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
    previous: {
      allowNull: false,
      type: DataTypes.DOUBLE
    },
    book: {
      allowNull: false,
      type: DataTypes.DOUBLE
    },
    current: {
      allowNull: false,
      type: DataTypes.DOUBLE
    },
    status: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    }
  }, {
    sequelize,
    modelName: 'balance',
  });
  return Balance;
};