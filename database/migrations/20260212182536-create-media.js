"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("media", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
      },
      media_name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tag_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "tags", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("media");
  },
};
