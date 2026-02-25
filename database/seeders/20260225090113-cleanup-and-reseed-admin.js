"use strict";

const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1️⃣ Clean dependent tables first (FK safety order)
    await queryInterface.bulkDelete("user_roles", null, {});
    await queryInterface.bulkDelete("interviews", null, {});
    await queryInterface.bulkDelete("guests", null, {});
    await queryInterface.bulkDelete("studios", null, {});
    await queryInterface.bulkDelete("tags", null, {});
    await queryInterface.bulkDelete("media", null, {});
    await queryInterface.bulkDelete("users", null, {});

    // 2️⃣ Create new admin user
    const hashedPassword = await bcrypt.hash("StrongAdmin@123", 10);
    const adminId = uuidv4();

    await queryInterface.bulkInsert("users", [
      {
        id: adminId,
        full_name: "Admin User",
        username: "admin",
        email: "adminpms@realstorytime.com",
        password: hashedPassword,
        status: "active",
        email_verify_at: now,
        otp: null,
        otp_expires_at: null,
        remember_token: null,
        profile_image: null,
        mobile_number: null,
        enable_otp_login: false,
        otp_in_sms: false,
        otp_in_mail: false,
        created_at: now,
        updated_at: now,
      },
    ]);

    // 3️⃣ Attach Admin role
    const roles = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE role_name = 'Admin' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    if (!roles.length) {
      throw new Error("Admin role not found.");
    }

    await queryInterface.bulkInsert("user_roles", [
      {
        id: uuidv4(),
        user_id: adminId,
        role_id: roles[0].id,
        assigned_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("user_roles", null, {});
    await queryInterface.bulkDelete("users", null, {});
  },
};
