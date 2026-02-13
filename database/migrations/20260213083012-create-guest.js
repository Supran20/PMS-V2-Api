'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('guests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      designation: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      social_media: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      approved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      referred_by: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      profile_image: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('guests');
  },
};
