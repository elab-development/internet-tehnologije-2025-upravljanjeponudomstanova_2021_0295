'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Inquiries', 'phone', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('Inquiries', 'apartmentId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Apartments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Inquiries', 'apartmentId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Apartments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.removeColumn('Inquiries', 'phone');
  }
};

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
