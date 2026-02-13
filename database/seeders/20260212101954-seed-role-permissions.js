"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = await queryInterface.sequelize.query(
      `SELECT id, role_name FROM roles;`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    const permissions = await queryInterface.sequelize.query(
      `SELECT id, permission_type FROM permissions;`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    const roleMap = {};
    roles.forEach((r) => (roleMap[r.role_name] = r.id));

    const permissionMap = {};
    permissions.forEach((p) => (permissionMap[p.permission_type] = p.id));

    const now = new Date();

    await queryInterface.bulkInsert("role_permissions", [
      // Admin gets everything
      ...Object.values(permissionMap).map((pid) => ({
        id: Sequelize.Utils.toDefaultValue(Sequelize.UUIDV4()),
        role_id: roleMap["Admin"],
        permission_id: pid,
        granted_at: now,
      })),

      // Host permissions (only interview)
      {
        id: Sequelize.Utils.toDefaultValue(Sequelize.UUIDV4()),
        role_id: roleMap["Host"],
        permission_id: permissionMap["interview.create"],
        granted_at: now,
      },
      {
        id: Sequelize.Utils.toDefaultValue(Sequelize.UUIDV4()),
        role_id: roleMap["Host"],
        permission_id: permissionMap["interview.update"],
        granted_at: now,
      },
      {
        id: Sequelize.Utils.toDefaultValue(Sequelize.UUIDV4()),
        role_id: roleMap["Host"],
        permission_id: permissionMap["interview.view"],
        granted_at: now,
      },

      // Staff permissions (everything except user.manage & guest.auto_approve)
      ...Object.entries(permissionMap)
        .filter(
          ([key]) => key !== "user.manage" && key !== "guest.auto_approve",
        )
        .map(([_, pid]) => ({
          id: Sequelize.Utils.toDefaultValue(Sequelize.UUIDV4()),
          role_id: roleMap["Staff"],
          permission_id: pid,
          granted_at: now,
        })),
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("role_permissions", null, {});
  },
};
