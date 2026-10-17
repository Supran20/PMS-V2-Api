"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("guests", "guests_slug_key");

    await queryInterface.addConstraint("guests", {
      fields: ["channel_id", "slug"],
      type: "unique",
      name: "guests_channel_id_slug_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "guests",
      "guests_channel_id_slug_unique",
    );

    await queryInterface.addConstraint("guests", {
      fields: ["slug"],
      type: "unique",
      name: "guests_slug_key",
    });
  },
};
