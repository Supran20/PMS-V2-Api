"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn("user_permissions", "created_at");
    await queryInterface.removeColumn("user_permissions", "updated_at");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("user_permissions", "created_at", {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    });
    await queryInterface.addColumn("user_permissions", "updated_at", {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    });
  },
};
