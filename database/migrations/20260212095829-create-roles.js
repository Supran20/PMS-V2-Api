"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Required for uuid_generate_v4() in Postgres
    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
    );

    await queryInterface.createTable("roles", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
        allowNull: false,
      },

      role_name: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
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
    await queryInterface.dropTable("roles");
  },
};
