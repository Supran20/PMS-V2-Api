"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("permissions", [
      {
        id: uuidv4(),
        permission_type: "user.manage",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        permission_type: "interview.create",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        permission_type: "interview.update",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        permission_type: "interview.view",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        permission_type: "interview.delete",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        permission_type: "guest.manage",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        permission_type: "guest.auto_approve",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        permission_type: "location.manage",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("permissions", null, {});
  },
};
