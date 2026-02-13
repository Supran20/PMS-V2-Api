"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Required for uuid_generate_v4() in Postgres
    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
    );

    await queryInterface.createTable("user_roles", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users", // lowercase table name
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "roles", // lowercase table name
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      assigned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("user_roles");
  },
};
