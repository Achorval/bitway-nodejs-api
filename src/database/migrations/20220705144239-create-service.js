'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('services', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      slug: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      imageUrl: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      url: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      color: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      rate: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      description: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      status: {
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.dropTable('services');
  }
};