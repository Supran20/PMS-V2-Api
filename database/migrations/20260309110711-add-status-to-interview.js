"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("interviews", "status", {
      type: Sequelize.ENUM(
        "scheduled",
        "postponed",
        "cancelled",
        "recorded",
        "editing",
        "post_editing",
        "published",
      ),
      allowNull: false,
      defaultValue: "scheduled",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("interviews", "status");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_interviews_status";',
    );
  },
};
