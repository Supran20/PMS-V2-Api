"use strict";

const TABLES = [
  "users",
  "guests",
  "guest_notes",
  "studios",
  "interviews",
  "media",
  "tags",
  "logs",
];

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const table of TABLES) {
      await queryInterface.changeColumn(table, "channel_id", {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "channels", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    for (const table of TABLES) {
      await queryInterface.changeColumn(table, "channel_id", {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "channels", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
    }
  },
};
