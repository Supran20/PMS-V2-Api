import User from "./users/user.model";
import Role from "./roles/role.model";
import Permission from "./permissions/permission.model";
import UserRole from "./user_roles/user_role.model";
import RolePermission from "./role_permissions/role_permission.model";
import Tags from "./tags/tags.model";
import Media from "./media/media.model";

export const setupAssociations = () => {
  User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: "user_id",
    as: "roles",
  });

  Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: "role_id",
    as: "users",
  });

  Role.belongsToMany(Permission, {
    through: RolePermission,
    foreignKey: "role_id",
    as: "permissions",
  });

  Permission.belongsToMany(Role, {
    through: RolePermission,
    foreignKey: "permission_id",
    as: "roles",
  });

  // Tags
  Tags.hasMany(Media, { foreignKey: "tag_id", as: "media" });

  Tags.belongsTo(User, {
    as: "creator",
    foreignKey: "created_by",
    onDelete: "SET NULL",
  });

  Tags.belongsTo(User, {
    as: "updater",
    foreignKey: "updated_by",
    onDelete: "SET NULL",
  });

  Media.belongsTo(Tags, {
    foreignKey: "tag_id",
    onDelete: "SET NULL",
    as: "tag",
  });

  Media.belongsTo(User, {
    foreignKey: "created_by",
    onDelete: "SET NULL",
    as: "creator",
  });

  Media.belongsTo(User, {
    foreignKey: "updated_by",
    onDelete: "SET NULL",
    as: "updater",
  });
};
