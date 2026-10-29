"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("channels", "logo_media_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "media", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("channels", "description", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("channels", "social_links", {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("channels", "social_links");
    await queryInterface.removeColumn("channels", "description");
    await queryInterface.removeColumn("channels", "logo_media_id");
  },
};
