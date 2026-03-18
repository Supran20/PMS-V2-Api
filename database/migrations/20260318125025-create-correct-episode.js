"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = "interviews";

    // 🔍 Get all constraints
    const constraints = await queryInterface.sequelize.query(
      `
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = '${tableName}'::regclass;
      `,
      { type: Sequelize.QueryTypes.SELECT },
    );

    // 🧹 Remove ALL episode-related constraints
    for (const c of constraints) {
      if (c.conname.includes("episode")) {
        try {
          await queryInterface.removeConstraint(tableName, c.conname);
          console.log(`Removed constraint: ${c.conname}`);
        } catch (e) {}
      }
    }

    // 🔍 Get all indexes
    const indexes = await queryInterface.sequelize.query(
      `
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = '${tableName}';
      `,
      { type: Sequelize.QueryTypes.SELECT },
    );

    // 🧹 Remove ALL episode-related indexes
    for (const idx of indexes) {
      if (idx.indexname.includes("episode")) {
        try {
          await queryInterface.removeIndex(tableName, idx.indexname);
          console.log(`Removed index: ${idx.indexname}`);
        } catch (e) {}
      }
    }

    // 🔧 Ensure column is NOT unique
    await queryInterface.changeColumn(tableName, "episode", {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("interviews", "episode", {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
    });
  },
};
