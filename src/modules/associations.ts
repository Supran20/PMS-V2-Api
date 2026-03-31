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
import GuestNote from "./guest_note/guest_note.model";
import Settings from "./settings/settings.model";
import PermissionSettings from "./settings/permission_settings/permission_set.model";
import Log from "./log/log.model";

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
    onDelete: "SET NULL",
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

  Guest.hasMany(GuestNote, {
    foreignKey: "guest_id",
    as: "notes",
    onDelete: "CASCADE",
  });

  //   Guest.belongsToMany(Tags, {
  //   through: "guest_tags",
  //   foreignKey: "guest_id",
  //   otherKey: "tag_id",
  //   as: "tags_data",
  // });

  // Tags.belongsToMany(Guest, {
  //   through: "guest_tags",
  //   foreignKey: "tag_id",
  //   otherKey: "guest_id",
  // });

  //------------------------------------------------
  // GUEST NOTE ASSOCIATIONS
  //------------------------------------------------

  GuestNote.belongsTo(Guest, {
    foreignKey: "guest_id",
    as: "guest",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  GuestNote.belongsTo(User, {
    foreignKey: "created_by",
    as: "creator",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });

  GuestNote.belongsTo(User, {
    foreignKey: "updated_by",
    as: "updater",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
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

  Guest.belongsTo(User, {
    foreignKey: "host_id",
    as: "host",
  });

  User.hasMany(Guest, {
    foreignKey: "host_id",
    as: "hostedGuests",
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
    foreignKey: "created_by",
    as: "creator",
    onDelete: "SET NULL",
  });

  Interview.belongsTo(User, {
    foreignKey: "updated_by",
    as: "updater",
    onDelete: "SET NULL",
  });

  //------------------------------------------------
  // SETTINGS ASSOCIATIONS
  //------------------------------------------------
  Settings.belongsTo(User, { as: "creator", foreignKey: "created_by" });
  Settings.belongsTo(User, { as: "updater", foreignKey: "updated_by" });

  //------------------------------------------------
  // PERMISSIONS SETTINGS ASSOCIATIONS
  //------------------------------------------------

  PermissionSettings.belongsTo(Settings, {
    foreignKey: "settings_id",
    as: "settings",
  });

  PermissionSettings.belongsTo(User, {
    foreignKey: "created_by",
    as: "creator",
  });

  PermissionSettings.belongsTo(User, {
    foreignKey: "updated_by",
    as: "updater",
  });

  //------------------------------------------------
  // LOG ASSOCIATIONS
  //------------------------------------------------
  Log.belongsTo(User, {
    foreignKey: "created_by",
    as: "creator",
  });

  Log.belongsTo(User, {
    foreignKey: "updated_by",
    as: "updater",
  });
};
