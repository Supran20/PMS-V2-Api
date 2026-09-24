"use strict";

const TABLES = [
  "users",
  "guests",
  "guest_notes",
  "studios",
  "interviews",
  "media",
  "tags",
  "logs",
];

module.exports = {
  async up(queryInterface) {
    for (const table of TABLES) {
      await queryInterface.sequelize.query(`
        UPDATE ${table}
        SET channel_id = (SELECT id FROM channels WHERE slug = 'default')
        WHERE channel_id IS NULL;
      `);
    }
  },

  async down(queryInterface) {
    for (const table of TABLES) {
      await queryInterface.sequelize.query(`
        UPDATE ${table} SET channel_id = NULL;
      `);
    }
  },
};
