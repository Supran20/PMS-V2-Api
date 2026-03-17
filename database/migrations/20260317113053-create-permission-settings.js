"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("permission_settings", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
      },

      settings_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "settings", key: "id" }, // ✅ correct reference
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // 🔥 if settings deleted → permissions removed
      },

      permission_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      user_ids: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },

      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // 🔥 IMPORTANT: Prevent duplicate permission types per settings
    await queryInterface.addConstraint("permission_settings", {
      fields: ["settings_id", "permission_type"],
      type: "unique",
      name: "unique_settings_permission_type",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("permission_settings");
  },
};
