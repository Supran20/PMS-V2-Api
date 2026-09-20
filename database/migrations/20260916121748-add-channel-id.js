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
      await queryInterface.addColumn(table, "channel_id", {
        type: Sequelize.UUID,
        allowNull: true, // nullable for now — backfill first, then a follow-up migration sets NOT NULL
        references: { model: "channels", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
    }
  },

  async down(queryInterface) {
    for (const table of TABLES) {
      await queryInterface.removeColumn(table, "channel_id");
    }
  },
};
