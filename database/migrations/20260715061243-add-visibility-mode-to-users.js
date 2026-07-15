"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "visibility_mode", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "default",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "visibility_mode");
  },
};
