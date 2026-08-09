"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("interviews", "cc_user_ids", {
      type: Sequelize.ARRAY(Sequelize.UUID),
      allowNull: true,
      defaultValue: [],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("interviews", "cc_user_ids");
  },
};
