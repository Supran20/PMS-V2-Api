"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("studios", "studios_slug_key");

    await queryInterface.addConstraint("studios", {
      fields: ["channel_id", "slug"],
      type: "unique",
      name: "studios_channel_id_slug_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "studios",
      "studios_channel_id_slug_unique",
    );

    await queryInterface.addConstraint("studios", {
      fields: ["slug"],
      type: "unique",
      name: "studios_slug_key",
    });
  },
};
