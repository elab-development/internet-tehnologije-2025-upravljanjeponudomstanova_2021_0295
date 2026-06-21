'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Reservations', 'createdByUserId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('Reservations', 'customerName', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Reservations', 'customerEmail', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Reservations', 'customerPhone', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Reservations', 'agreedPrice', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Reservations', 'createdByUserId');
    await queryInterface.removeColumn('Reservations', 'customerName');
    await queryInterface.removeColumn('Reservations', 'customerEmail');
    await queryInterface.removeColumn('Reservations', 'customerPhone');
    await queryInterface.removeColumn('Reservations', 'agreedPrice');
  }
};
