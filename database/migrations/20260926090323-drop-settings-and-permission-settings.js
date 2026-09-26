"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // permission_settings has an FK to settings, so it must be dropped first
    await queryInterface.dropTable("permission_settings");
    await queryInterface.dropTable("settings");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable("settings", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
      },

      type: {
        type: Sequelize.STRING,
        allowNull: false,
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

    await queryInterface.createTable("permission_settings", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
      },

      settings_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "settings", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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

    await queryInterface.addConstraint("permission_settings", {
      fields: ["settings_id", "permission_type"],
      type: "unique",
      name: "unique_settings_permission_type",
    });
  },
};
