"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_permissions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      permission_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "permissions", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      granted_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
    });

    await queryInterface.addConstraint("user_permissions", {
      fields: ["user_id", "permission_id"],
      type: "unique",
      name: "user_permissions_user_id_permission_id_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("user_permissions");
  },
};
