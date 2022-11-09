'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PasswordReset extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PasswordReset.init({
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    token: {
      allowNull: false,
      type: DataTypes.STRING(200)
    },
    ip: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    device: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    status: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    }
  }, {
    sequelize,
    modelName: 'passwordReset',
  });
  return PasswordReset;
};