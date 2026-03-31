"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("guests", "tag_ids", {
      type: Sequelize.ARRAY(Sequelize.UUID),
      allowNull: true,
      defaultValue: [],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("guests", "tag_ids");
  },
};
