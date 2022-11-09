'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      firstname: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      lastname: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      photoUrl: {
        required: false,
        allowNull: false,
        type: Sequelize.STRING(255)
      },
      email: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(100)
      },
      isEmailVerified: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      emailVerifiedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      phone: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(20)
      },
      phoneVerificationCode: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      isPhoneVerified: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      phoneVerifiedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      dob: {
        allowNull: false,
        type: Sequelize.STRING(30)
      },
      gender: {
        allowNull: false,
        type: Sequelize.STRING(10)
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      bvn: {
        unique: true,
        allowNull: true,
        type: Sequelize.STRING(20)
      },
      isBvnVerified: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      bvnVerifiedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      isDocumentVerified: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      documentVerifiedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      transactionPin: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      hasTransactionPin: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      balanceStatus: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      rememberToken: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      roleId: {
        references: {
          model: {
            tableName: 'roles'
          },
          key: 'id'
        },
        allowNull: false,
        type: Sequelize.INTEGER
      },
      blocked: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      blockedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      blockedReason: {
        allowNull: false,
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('users');
  }
};