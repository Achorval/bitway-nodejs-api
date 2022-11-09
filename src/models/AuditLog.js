'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AuditLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AuditLog.belongsTo(models.user);
    }
  }
  AuditLog.init({
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
    request: {
      allowNull: true,
      type: DataTypes.JSON
    },
    response: {
      allowNull: true,
      type: DataTypes.JSON
    },
    url: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    device: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    channel: {
      allowNull: false,
      type: DataTypes.STRING(10)
    },
    ipAddress: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    action: {
      allowNull: false,
      type: DataTypes.STRING(50)
    }
  }, {
    sequelize,
    modelName: 'auditLog',
  });
  return AuditLog;
};