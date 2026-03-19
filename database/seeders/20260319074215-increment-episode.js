"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // shift all episodes >= 12 by +1
    await queryInterface.sequelize.query(`
      UPDATE interviews
      SET episode = episode + 1
      WHERE episode >= 12;
    `);
  },

  async down(queryInterface, Sequelize) {
    // revert back (shift down)
    await queryInterface.sequelize.query(`
      UPDATE interviews
      SET episode = episode - 1
      WHERE episode >= 13;
    `);
  },
};
