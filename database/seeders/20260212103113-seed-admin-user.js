"use strict";

const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const password = "supranmaharjanpodcast@2026";
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Find the Super Admin role seeded by seed-roles.js.
    const roles = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE role_name = 'Super Admin' LIMIT 1;`,
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    if (!roles.length) {
      throw new Error("Super Admin role not found. Seed roles first.");
    }

    const superAdminRoleId = roles[0].id;

    // Create the Super Admin user.
    await queryInterface.bulkInsert("users", [
      {
        id: userId,
        full_name: "Supran Maharjan",
        email: "msupran17@gmail.com",
        password: hashedPassword,
        status: "active",
        email_verify_at: now,
        otp: null,
        otp_expires_at: null,
        remember_token: null,
        remember_token_expires_at: null,
        remember_until: null,
        profile_image: null,
        mobile_number: null,
        enable_otp_login: false,
        otp_in_sms: false,
        otp_in_mail: false,
        visibility_mode: "default",
        visibility_start_date: null,
        visibility_end_date: null,
        hide_guest_contacts: false,
        created_at: now,
        updated_at: now,
      },
    ]);

    // Assign the Super Admin role to the user.
    await queryInterface.bulkInsert("user_roles", [
      {
        id: uuidv4(),
        user_id: userId,
        role_id: superAdminRoleId,
        assigned_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'msupran17@gmail.com' LIMIT 1;`,
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    if (!users.length) {
      return;
    }

    const userId = users[0].id;

    // Delete only this user's role assignments.
    await queryInterface.bulkDelete("user_roles", {
      user_id: userId,
    });

    // Delete only the seeded Super Admin user.
    await queryInterface.bulkDelete("users", {
      id: userId,
    });
  },
};
