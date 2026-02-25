"use strict";

const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1️⃣ Remove old admin user safely
    await queryInterface.bulkDelete("user_roles", null, {
      email: "adminpms@realstorytime.com",
    });
    await queryInterface.bulkDelete(
      "users",
      { email: "adminpms@realstorytime.com" },
      {},
    );

    // 2️⃣ Hash password for new admin
    const hashedPassword = await bcrypt.hash("StrongAdmin@123", 10);
    const adminId = uuidv4();

    // 3️⃣ Insert new admin user
    await queryInterface.bulkInsert("users", [
      {
        id: adminId,
        full_name: "Admin User",
        username: "admin user",
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

    // 4️⃣ Fetch Admin Role ID
    const roles = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE role_name = 'Admin' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    if (!roles.length) {
      throw new Error("Admin role not found. Seed roles first.");
    }

    const adminRoleId = roles[0].id;

    // 5️⃣ Assign Admin Role
    await queryInterface.bulkInsert("user_roles", [
      {
        id: uuidv4(),
        user_id: adminId,
        role_id: adminRoleId,
        assigned_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    // Remove new admin user and roles
    await queryInterface.bulkDelete("user_roles", null, {});
    await queryInterface.bulkDelete(
      "users",
      { email: "adminpms@realstorytime.com" },
      {},
    );
  },
};
