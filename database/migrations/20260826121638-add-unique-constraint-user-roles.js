"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint("user_roles", {
      fields: ["user_id"],
      type: "unique",
      name: "user_roles_user_id_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      "user_roles",
      "user_roles_user_id_unique",
    );
  },
};
