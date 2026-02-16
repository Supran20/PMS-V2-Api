import User from "./users/user.model";
import Role from "./roles/role.model";
import Permission from "./permissions/permission.model";
import UserRole from "./user_roles/user_role.model";
import RolePermission from "./role_permissions/role_permission.model";
import Tags from "./tags/tags.model";
import Media from "./media/media.model";
import Guest from "./guest/guest.model";
import Studio from "./studio/studio.model";
import Interview from "./interview/interview.model";

export const setupAssociations = () => {
  User.belongsTo(Media, {
    foreignKey: "profile_image",
    as: "profileImage",
    onDelete: "SET NULL",
  });
  //------------------------------------------------
  // USER ↔ ROLE
  //------------------------------------------------
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

  //------------------------------------------------
  // ROLE ↔ PERMISSION
  //------------------------------------------------
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

  //------------------------------------------------
  // TAGS ↔ MEDIA
  //------------------------------------------------
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

  //------------------------------------------------
  // STUDIO ↔ USER (Creator / Updater)
  //------------------------------------------------
  Studio.belongsTo(User, {
    foreignKey: "created_by",
    as: "creator",
    onDelete: "SET NULL",
  });

  Studio.belongsTo(User, {
    foreignKey: "updated_by",
    as: "updater",
    onDelete: "SET NULL",
  });

  //------------------------------------------------
  // GUEST ASSOCIATIONS
  //------------------------------------------------

  Guest.belongsTo(Media, {
    foreignKey: "profile_image",
    as: "profileImage",
    onDelete: "SET NULL",
  });

  Guest.belongsTo(User, {
    foreignKey: "referred_by",
    as: "referrer",
    onDelete: "SET NULL",
  });

  Guest.belongsTo(User, {
    foreignKey: "approved_by",
    as: "approver",
    onDelete: "SET NULLL",
  });

  Guest.belongsTo(User, {
    foreignKey: "created_by",
    as: "creator",
    onDelete: "SET NULL",
  });

  Guest.belongsTo(User, {
    foreignKey: "updated_by",
    as: "updater",
    onDelete: "SET NULL",
  });

  //------------------------------------------------
  // INTERVIEW ASSOCIATIONS
  //------------------------------------------------

  // Interview → Guest
  Interview.belongsTo(Guest, {
    foreignKey: "guest_id",
    as: "guest",
    onDelete: "CASCADE",
  });

  Guest.hasMany(Interview, {
    foreignKey: "guest_id",
    as: "interviews",
  });

  // Interview → Host (User)
  Interview.belongsTo(User, {
    foreignKey: "host_id",
    as: "host",
    onDelete: "CASCADE",
  });

  User.hasMany(Interview, {
    foreignKey: "host_id",
    as: "hosted_interviews",
  });

  // Interview → Studio
  Interview.belongsTo(Studio, {
    foreignKey: "studio_id",
    as: "studio",
    onDelete: "CASCADE",
  });

  Studio.hasMany(Interview, {
    foreignKey: "studio_id",
    as: "interviews",
  });

  // Interview → Creator
  Interview.belongsTo(User, {
    foreignKey: "referred_by",
    as: "referrer",
    onDelete: "SET NULL",
  });

  Interview.belongsTo(User, {
    foreignKey: "created_by",
    as: "creator",
    onDelete: "SET NULL",
  });

  Interview.belongsTo(User, {
    foreignKey: "updated_by",
    as: "updater",
    onDelete: "SET NULL",
  });
};
