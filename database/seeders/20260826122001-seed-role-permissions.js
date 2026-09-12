"use strict";

const { v4: uuidv4 } = require("uuid");

// Default permission templates per role.
// Super Admin is intentionally excluded — it bypasses permission checks in code.
const ROLE_DEFAULTS = {
  Admin: [
    "users.view",
    "users.create",
    "users.edit",
    "users.delete",
    "roles.view",
    "roles.create",
    "roles.edit",
    "roles.delete",
    "guests.view",
    "guests.create",
    "guests.edit",
    "guests.delete",
    "guests.approve",
    "interviews.view",
    "interviews.create",
    "interviews.edit",
    "interviews.delete",
    "studio.view",
    "studio.create",
    "studio.edit",
    "studio.delete",
    "media.view",
    "media.create",
    "media.edit",
    "media.delete",
    "tags.view",
    "tags.create",
    "tags.edit",
    "tags.delete",
    "settings.view",
    "settings.edit",
    "guest_reapproval_requests.view",
    "guest_reapproval_requests.approve",
    "guest_reapproval_requests.reject",
    "logs.view",
    "logs.delete",
  ],
  Host: [
    "guests.view",
    "guests.create",
    "guests.edit",
    "guests.approve",
    "interviews.view",
    "interviews.create",
    "interviews.edit",
    "interviews.delete",
    "studio.view",
    "media.view",
    "media.create",
    "tags.view",
    "guest_reapproval_requests.view",
    "guest_reapproval_requests.approve",
    "guest_reapproval_requests.reject",
  ],
  Staff: [
    // "All except user management" — excludes users.* and roles.*
    "guests.view",
    "guests.create",
    "guests.edit",
    "guests.delete",
    "guests.approve",
    "interviews.view",
    "interviews.create",
    "interviews.edit",
    "interviews.delete",
    "studio.view",
    "studio.create",
    "studio.edit",
    "studio.delete",
    "media.view",
    "media.create",
    "media.edit",
    "media.delete",
    "tags.view",
    "tags.create",
    "tags.edit",
    "tags.delete",
    "settings.view",
    "settings.edit",
    "guest_reapproval_requests.view",
    "guest_reapproval_requests.approve",
    "guest_reapproval_requests.reject",
    "logs.view",
  ],
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const roles = await queryInterface.sequelize.query(
      `SELECT id, role_name FROM roles WHERE role_name IN (:roleNames)`,
      {
        replacements: { roleNames: Object.keys(ROLE_DEFAULTS) },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      },
    );

    const permissions = await queryInterface.sequelize.query(
      `SELECT id, permission_type FROM permissions`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    const permissionIdByType = new Map(
      permissions.map((p) => [p.permission_type, p.id]),
    );

    const rows = [];

    for (const role of roles) {
      const defaultTypes = ROLE_DEFAULTS[role.role_name] || [];

      for (const type of defaultTypes) {
        const permissionId = permissionIdByType.get(type);

        if (!permissionId) {
          // Guards against typos in ROLE_DEFAULTS vs. the permissions catalog
          throw new Error(
            `Unknown permission_type "${type}" referenced for role "${role.role_name}"`,
          );
        }

        rows.push({
          id: uuidv4(),
          role_id: role.id,
          permission_id: permissionId,
          granted_at: now,
        });
      }
    }

    if (rows.length) {
      await queryInterface.bulkInsert("role_permissions", rows);
    }
  },

  async down(queryInterface) {
    const roles = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE role_name IN (:roleNames)`,
      {
        replacements: { roleNames: Object.keys(ROLE_DEFAULTS) },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      },
    );

    const roleIds = roles.map((r) => r.id);

    if (roleIds.length) {
      await queryInterface.bulkDelete("role_permissions", {
        role_id: roleIds,
      });
    }
  },
};
