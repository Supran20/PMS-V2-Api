"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Clean invalid UUID values first (production safety)
    await queryInterface.sequelize.query(`
      UPDATE users
      SET profile_image = NULL
      WHERE profile_image IS NOT NULL
      AND profile_image !~* '^[0-9a-fA-F-]{36}$';
    `);

    // Proper type conversion with USING
    await queryInterface.sequelize.query(`
      ALTER TABLE users
      ALTER COLUMN profile_image TYPE UUID
      USING profile_image::uuid;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE users
      ALTER COLUMN profile_image TYPE VARCHAR;
    `);
  },
};
