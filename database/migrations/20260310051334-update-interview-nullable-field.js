"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("interviews", "interview_date", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn("interviews", "start_time", {
      type: Sequelize.TIME,
      allowNull: true,
    });

    await queryInterface.changeColumn("interviews", "end_time", {
      type: Sequelize.TIME,
      allowNull: true,
    });

    await queryInterface.addColumn("interviews", "youtube_title", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("interviews", "interview_date", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("interviews", "start_time", {
      type: Sequelize.TIME,
      allowNull: false,
    });

    await queryInterface.changeColumn("interviews", "end_time", {
      type: Sequelize.TIME,
      allowNull: false,
    });

    await queryInterface.removeColumn("interviews", "youtube_title");
  },
};
