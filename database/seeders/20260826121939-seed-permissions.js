"use strict";

const { v4: uuidv4 } = require("uuid");

const PERMISSIONS = [
  // Users
  { type: "users.view", description: "View users" },
  { type: "users.create", description: "Create users" },
  { type: "users.edit", description: "Edit users" },
  { type: "users.delete", description: "Delete users" },

  // Roles
  { type: "roles.view", description: "View roles" },
  { type: "roles.create", description: "Create roles" },
  { type: "roles.edit", description: "Edit roles" },
  { type: "roles.delete", description: "Delete roles" },

  // Guests
  { type: "guests.view", description: "View guests" },
  { type: "guests.create", description: "Create guests" },
  { type: "guests.edit", description: "Edit guests" },
  { type: "guests.delete", description: "Delete guests" },
  { type: "guests.approve", description: "Approve guests" },

  // Interviews
  { type: "interviews.view", description: "View interviews" },
  { type: "interviews.create", description: "Create interviews" },
  { type: "interviews.edit", description: "Edit interviews" },
  { type: "interviews.delete", description: "Delete interviews" },

  // Studio
  { type: "studio.view", description: "View studios" },
  { type: "studio.create", description: "Create studios" },
  { type: "studio.edit", description: "Edit studios" },
  { type: "studio.delete", description: "Delete studios" },

  // Media
  { type: "media.view", description: "View media" },
  { type: "media.create", description: "Upload media" },
  { type: "media.edit", description: "Edit media" },
  { type: "media.delete", description: "Delete media" },

  // Tags
  { type: "tags.view", description: "View tags" },
  { type: "tags.create", description: "Create tags" },
  { type: "tags.edit", description: "Edit tags" },
  { type: "tags.delete", description: "Delete tags" },

  // Settings
  { type: "settings.view", description: "View settings" },
  { type: "settings.edit", description: "Edit settings" },

  // Guest Reapproval Requests
  {
    type: "guest_reapproval_requests.view",
    description: "View guest reapproval requests",
  },
  {
    type: "guest_reapproval_requests.approve",
    description: "Approve guest reapproval requests",
  },
  {
    type: "guest_reapproval_requests.reject",
    description: "Reject guest reapproval requests",
  },

  // Log
  { type: "logs.view", description: "View logs" },
  { type: "logs.delete", description: "Delete logs" },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert(
      "permissions",
      PERMISSIONS.map((p) => ({
        id: uuidv4(),
        permission_type: p.type,
        description: p.description,
        created_at: now,
        updated_at: now,
      })),
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("permissions", null, {});
  },
};
