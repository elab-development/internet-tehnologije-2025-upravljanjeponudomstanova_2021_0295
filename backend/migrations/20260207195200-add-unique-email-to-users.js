'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('Users', {
      fields: ['email'],
      type: 'unique',
      name: 'uq_users_email'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Users', 'uq_users_email');
  }
};
