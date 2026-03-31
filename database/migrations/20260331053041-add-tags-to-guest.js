"use strict";

/**
 * Add tags column to guests table
 * - Uses JSONB for flexible array storage
 * - Default empty array to avoid null checks
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("guests", "tags", {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("guests", "tags");
  },
};
