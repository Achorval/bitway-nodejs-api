'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Service.hasOne(models.transaction);
    }
  }
  Service.init({
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    slug: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    imageUrl: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    url: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    color: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    rate: {
      allowNull: false,
      type: DataTypes.DOUBLE
    },
    description: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    status: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN
    }
  }, {
    sequelize,
    modelName: 'service',
    paranoid: true,
    timestamps: true
  });
  return Service;
};