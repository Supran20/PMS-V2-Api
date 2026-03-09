"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // -----------------------------
    // Create ENUM type for status
    // -----------------------------
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_guests_status" AS ENUM (
        'not_started',
        'contacted',
        'follow_up',
        'confirmed'
      );
    `);

    // -----------------------------
    // Add status column
    // -----------------------------
    await queryInterface.addColumn("guests", "status", {
      type: "enum_guests_status",
      allowNull: false,
      defaultValue: "not_started",
    });

    // -----------------------------
    // Add record column
    // -----------------------------
    await queryInterface.addColumn("guests", "record", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("guests", "status");
    await queryInterface.removeColumn("guests", "record");

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_guests_status";
    `);
  },
};
