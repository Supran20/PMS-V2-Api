"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Add the episode column (nullable first to avoid conflicts)
    await queryInterface.addColumn("interviews", "episode", {
      type: Sequelize.INTEGER,
      allowNull: true, // temporarily nullable
      unique: true,
    });

    // 2️⃣ Fetch all interviews ordered by interview_date (oldest first)
    const [interviews] = await queryInterface.sequelize.query(
      `SELECT id FROM interviews ORDER BY interview_date ASC, created_at ASC`,
    );

    // 3️⃣ Assign episode numbers starting from 1
    for (let i = 0; i < interviews.length; i++) {
      await queryInterface.sequelize.query(
        `UPDATE interviews SET episode = ${i + 1} WHERE id = '${interviews[i].id}'`,
      );
    }

    // 4️⃣ Alter the column to NOT NULL now that all rows have values
    await queryInterface.changeColumn("interviews", "episode", {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
    });
  },

  async down(queryInterface) {
    // Remove episode column on rollback
    await queryInterface.removeColumn("interviews", "episode");
  },
};
