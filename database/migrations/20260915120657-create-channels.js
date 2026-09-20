"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("channels", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
      },
      channel_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.STRING, // active, suspended, trial, cancelled
        defaultValue: "trial",
        allowNull: false,
      },
      subscription_plan_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "subscription_plans", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      subscription_status: {
        type: Sequelize.STRING, // trialing, active, past_due, cancelled
        allowNull: true,
      },
      trial_ends_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("channels");
  },
};
