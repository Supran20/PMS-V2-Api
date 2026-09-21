"use strict";

const TABLES = ["subscription_plans", "channels"];
const AUDIT_COLUMNS = ["created_by", "updated_by"];

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const table of TABLES) {
      const existing = await queryInterface.describeTable(table);

      for (const column of AUDIT_COLUMNS) {
        // Skip if the column is already there (e.g. fresh DB where the
        // channels createTable migration already includes it).
        if (existing[column]) continue;

        await queryInterface.addColumn(table, column, {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: "users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        });
      }
    }
  },

  async down(queryInterface) {
    for (const table of TABLES) {
      const existing = await queryInterface.describeTable(table);

      for (const column of AUDIT_COLUMNS) {
        if (existing[column]) {
          await queryInterface.removeColumn(table, column);
        }
      }
    }
  },
};
