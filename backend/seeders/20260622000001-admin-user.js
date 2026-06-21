'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const hashed = await bcrypt.hash('admin123', 10);
    const now = new Date();

    await queryInterface.bulkInsert('Users', [
      {
        fullName:  'Administrator',
        email:     'admin@admin.com',
        password:  hashed,
        role:      'ADMIN',
        isActive:  true,
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Users', { email: 'admin@admin.com' });
  }
};
