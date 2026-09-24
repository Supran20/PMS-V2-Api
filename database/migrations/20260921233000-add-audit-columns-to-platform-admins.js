"use strict";

const AUDIT_COLUMNS = ["created_by", "updated_by"];

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = "platform_admins";
    const existing = await queryInterface.describeTable(table);

    for (const column of AUDIT_COLUMNS) {
      if (existing[column]) continue;

      await queryInterface.addColumn(table, column, {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
  },

  async down(queryInterface) {
    const table = "platform_admins";
    const existing = await queryInterface.describeTable(table);

    for (const column of AUDIT_COLUMNS) {
      if (existing[column]) {
        await queryInterface.removeColumn(table, column);
      }
    }
  },
};
