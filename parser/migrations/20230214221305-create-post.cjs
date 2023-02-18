'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      url: {
        type: Sequelize.STRING(555),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(750),
        allowNull: true,
        // unique: true,
      },
      status: {
        type: Sequelize.INTEGER,
      },
      html: {
        type: Sequelize.TEXT('long'),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
    // await queryInterface.addIndex('Posts', 'url',{
    //   fields: 'url',
    //   unique: true,
    // })
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Posts')
  },
}