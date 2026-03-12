"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // remove unique constraint from episode column
    await queryInterface.changeColumn("interviews", "episode", {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: false,
    });

    // drop the automatically created unique index if it exists
    try {
      await queryInterface.removeConstraint(
        "interviews",
        "interviews_episode_key",
      );
    } catch (e) {}

    try {
      await queryInterface.removeIndex("interviews", "interviews_episode_key");
    } catch (e) {}
  },

  async down(queryInterface, Sequelize) {
    // restore unique constraint if rollback
    await queryInterface.changeColumn("interviews", "episode", {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
    });
  },
};
