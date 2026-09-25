"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable(
      "guest_reapproval_requests",
    );

    if (!table.channel_id) {
      await queryInterface.addColumn(
        "guest_reapproval_requests",
        "channel_id",
        {
          type: Sequelize.UUID,
          allowNull: true, // widened first — backfilled below, then tightened to NOT NULL
          references: { model: "channels", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
      );
    }

    // Backfill from the related guest's channel_id. guest_id is NOT NULL on
    // every existing row (per the model), so every row has a valid source.
    await queryInterface.sequelize.query(`
      UPDATE guest_reapproval_requests grr
      SET channel_id = g.channel_id
      FROM guests g
      WHERE grr.guest_id = g.id
        AND grr.channel_id IS NULL;
    `);

    await queryInterface.changeColumn(
      "guest_reapproval_requests",
      "channel_id",
      {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "channels", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      "guest_reapproval_requests",
      "channel_id",
    );
  },
};
