"use strict";

const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1️⃣ Check if already exists (idempotent)
    const existing = await queryInterface.sequelize.query(
      `SELECT id FROM settings WHERE type = 'permission_settings' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    if (existing.length > 0) {
      console.log("✅ permission_settings already seeded");
      return;
    }

    // 2️⃣ Get any admin user (fallback)
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    const userId = users.length ? users[0].id : null;

    // 3️⃣ Insert settings row
    await queryInterface.bulkInsert("settings", [
      {
        id: uuidv4(), // ⚠️ dynamic ID (important)
        type: "permission_settings",
        created_by: userId,
        updated_by: userId,
        created_at: now,
        updated_at: now,
      },
    ]);

    console.log("✅ permission_settings seeded");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "settings",
      { type: "permission_settings" },
      {},
    );
  },
};
