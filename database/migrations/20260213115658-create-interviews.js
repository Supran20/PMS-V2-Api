"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("interviews", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
      },

      guest_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "guests",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      host_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      studio_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "studios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      interview_date: {
        type: Sequelize.STRING, // matches your model
        allowNull: false,
      },

      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      interview_status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "scheduled",
      },

      live_status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "not_live",
      },

      google_drive_link: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      youtube_link: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    //-------------------------------------------------------
    // Indexes (IMPORTANT for overlap performance)
    //-------------------------------------------------------
    await queryInterface.addIndex("interviews", ["guest_id"]);
    await queryInterface.addIndex("interviews", ["host_id"]);
    await queryInterface.addIndex("interviews", ["studio_id"]);
    await queryInterface.addIndex("interviews", ["interview_date"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("interviews");
  },
};
