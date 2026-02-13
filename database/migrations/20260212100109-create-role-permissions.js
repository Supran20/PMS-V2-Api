"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
    );

    await queryInterface.createTable("role_permissions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
        allowNull: false,
      },

      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      permission_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "permissions",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      granted_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("role_permissions");
  },
};
