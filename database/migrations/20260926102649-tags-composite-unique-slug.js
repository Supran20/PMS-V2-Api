"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("tags", "tags_slug_key");

    await queryInterface.addConstraint("tags", {
      fields: ["channel_id", "slug"],
      type: "unique",
      name: "tags_channel_id_slug_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "tags",
      "tags_channel_id_slug_unique",
    );

    await queryInterface.addConstraint("tags", {
      fields: ["slug"],
      type: "unique",
      name: "tags_slug_key",
    });
  },
};
