'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.bankAccount);

      User.hasOne(models.transaction);

      User.hasOne(models.balance);
    }
  }
  User.init({
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    firstname: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    lastname: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    photoUrl: {
      required: false,
      allowNull: false,
      type: DataTypes.STRING(255)
    },
    email: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING(100)
    },
    isEmailVerified: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
    emailVerifiedAt: {
      allowNull: true,
      type: DataTypes.DATE
    },
    phone: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING(20)
    },
    phoneVerificationCode: {
      allowNull: false,
      type: DataTypes.STRING(20)
    },
    isPhoneVerified: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
    phoneVerifiedAt: {
      allowNull: true,
      type: DataTypes.DATE
    },
    dob: {
      allowNull: false,
      type: DataTypes.STRING(30)
    },
    gender: {
      allowNull: false,
      type: DataTypes.STRING(10)
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    bvn: {
      unique: true,
      allowNull: true,
      type: DataTypes.STRING(20)
    },
    isBvnVerified: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
    bvnVerifiedAt: {
      allowNull: true,
      type: DataTypes.DATE
    },
    isDocumentVerified: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
    documentVerifiedAt: {
      allowNull: true,
      type: DataTypes.DATE
    },
    transactionPin: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    hasTransactionPin: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
    balanceStatus: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
    rememberToken: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    roleId: {
      references: {
        model: {
          tableName: 'roles'
        },
        key: 'id'
      },
      allowNull: false,
      type: DataTypes.INTEGER
    },
    blocked: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
    blockedAt: {
      allowNull: true,
      type: DataTypes.DATE
    },
    blockedReason: {
      allowNull: false,
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'user',
    paranoid: true,
    timestamps: true
  });
  return User;
};