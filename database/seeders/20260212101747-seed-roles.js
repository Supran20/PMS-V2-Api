"use strict";

const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("roles", [
      {
        id: uuidv4(),
        role_name: "Super Admin",
        description: "Full admin privileges",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        role_name: "Admin",
        description: "Admin panel access",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        role_name: "Host",
        description: "Can manage interviews",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        role_name: "Staff",
        description: "All except user management",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("roles", null, {});
  },
};
