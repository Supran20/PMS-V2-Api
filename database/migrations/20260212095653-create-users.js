"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Required for uuid_generate_v4() in Postgres
    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
    );

    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
        allowNull: false,
      },

      full_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      status: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "active",
      },

      email_verify_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      otp: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      otp_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      remember_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      profile_image: {
        type: Sequelize.UUID,
        allowNull: true,
      },

      mobile_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      enable_otp_login: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      otp_in_sms: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      otp_in_mail: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
