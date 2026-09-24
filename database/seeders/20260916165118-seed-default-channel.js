"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const defaultChannelId = Sequelize.literal("uuid_generate_v4()");

    // 1. Create the default channel
    const [channelRows] = await queryInterface.sequelize.query(`
      INSERT INTO channels (id, channel_name, slug, status, subscription_status, created_at, updated_at)
      VALUES (uuid_generate_v4(), 'Default Channel', 'default', 'active', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id;
    `);
    const channelId = channelRows[0].id;

    // 2. Find the existing Super Admin user (adjust the role lookup to match your seeder's actual role_name)
    const [superAdminRows] = await queryInterface.sequelize.query(`
      SELECT u.id FROM users u
      JOIN user_roles ur ON ur.user_id = u.id
      JOIN roles r ON r.id = ur.role_id
      WHERE r.role_name = 'Super Admin'
      LIMIT 1;
    `);

    if (superAdminRows.length === 0) {
      throw new Error(
        "No Super Admin user found — cannot seed platform admin / default channel admin.",
      );
    }
    const superAdminId = superAdminRows[0].id;

    // 3. Register them as a Platform Admin
    await queryInterface.sequelize.query(`
      INSERT INTO platform_admins (id, user_id, created_at, updated_at)
      VALUES (uuid_generate_v4(), '${superAdminId}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `);

    // 4. Store the channel id somewhere the next migration can read it back —
    //    simplest approach: stash it on the channel row itself via the known slug,
    //    so the backfill migration can look it up by slug rather than by a hardcoded id.
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DELETE FROM platform_admins;`);
    await queryInterface.sequelize.query(
      `DELETE FROM channels WHERE slug = 'default';`,
    );
  },
};
