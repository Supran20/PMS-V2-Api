import bcrypt from "bcryptjs";
import { sequelize } from "../../config/db";
import { Transaction } from "sequelize";
import User from "./user.model";
import Role from "../roles/role.model";
import ApiError from "../../middleware/error-handlers/ApiError";
import { UserAttributes } from "./user.interface";
import Media from "../media/media.model";

const USER_EXCLUDE_FIELDS = [
  "password",
  "otp",
  "otp_expires_at",
  "remember_token",
  "remember_token_expires_at",
];

// Roles that are subject to the created_at-based visibility restriction
const RESTRICTED_ROLES = ["Staff", "Host"];
const VISIBILITY_MODES = ["default", "range", "all"];

class UserService {
  //--------------------------------
  // CREATE USER
  //--------------------------------
  static async createUser(
    data: any,
    creator: any,
    file?: Express.Multer.File,
  ): Promise<User> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      const existingEmail = await User.findOne({
        where: { email: data.email },
        transaction,
      });

      if (existingEmail) {
        throw new ApiError(400, "Email already exists");
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Visibility settings only apply to Staff/Host.
      // Admin is always unrestricted, so we force these regardless of
      // what was passed in (validation should already block this, but
      // the service layer shouldn't trust that alone).
      const isRestrictedRole = RESTRICTED_ROLES.includes(data.role_name);

      let visibility_mode = "default";
      let visibility_start_date: Date | null = null;
      let visibility_end_date: Date | null = null;

      if (isRestrictedRole) {
        visibility_mode = VISIBILITY_MODES.includes(data.visibility_mode)
          ? data.visibility_mode
          : "default";

        if (visibility_mode === "range") {
          // start is required in range mode (validation enforces this);
          // end is optional — a null end means "start through now".
          visibility_start_date = data.visibility_start_date ?? null;
          visibility_end_date = data.visibility_end_date ?? null;
        }
        // "default" and "all" both mean no explicit dates stored —
        // "all" carries its meaning through mode alone.
      }

      const user = await User.create(
        {
          ...data,
          password: hashedPassword,
          visibility_mode,
          visibility_start_date,
          visibility_end_date,
          hide_guest_contacts: data.hide_guest_contacts ?? false,
        },
        { transaction },
      );

      const role = await Role.findOne({
        where: { role_name: data.role_name },
        transaction,
      });

      if (!role) {
        throw new ApiError(404, "Role not found");
      }

      await user.addRole(role, { transaction });

      if (file) {
        const originalName = file.originalname;
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
        const sanitizedMediaName = nameWithoutExt
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");
        const mediaPath = `/uploads/media/${file.filename}`;

        const media = await Media.create(
          {
            media_name: sanitizedMediaName,
            path: mediaPath,
            type: file.mimetype,
            created_by: creator.id,
            updated_by: creator.id,
          },
          { transaction },
        );

        user.profile_image = media.id;
        await user.save({ transaction });
      }

      await transaction.commit();

      return user;
    } catch (error) {
      // 🔥 Cleanup uploaded file if transaction fails
      if (file) {
        const fs = await import("fs");
        const fullPath = file.path;

        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }

      await transaction.rollback();
      throw error;
    }
  }

  //--------------------------------
  // GET ALL USERS
  //--------------------------------
  static async getAllUsers(): Promise<User[]> {
    return await User.findAll({
      attributes: {
        exclude: USER_EXCLUDE_FIELDS,
      },
      include: [
        {
          model: Role,
          as: "roles",
          through: { attributes: [] },
        },
        {
          model: Media,
          as: "profileImage",
          attributes: ["id", "media_name", "path", "type"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  //--------------------------------
  // GET USER BY ID
  //--------------------------------
  static async getUserById(id: string): Promise<User> {
    const user = await User.findByPk(id, {
      attributes: {
        exclude: USER_EXCLUDE_FIELDS,
      },
      include: [
        {
          model: Role,
          as: "roles",
          through: { attributes: [] },
        },

        {
          model: Media,
          as: "profileImage",
          attributes: ["id", "media_name", "path", "type", "tag_id"],
        },
      ],
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }

  //--------------------------------
  // GET USERS BY ROLE (Host)
  //--------------------------------
  static async getHosts(): Promise<User[]> {
    return await User.findAll({
      attributes: {
        exclude: USER_EXCLUDE_FIELDS,
      },
      where: {
        status: "active",
      },
      include: [
        {
          model: Role,
          as: "roles",
          where: { role_name: "Host" },
          through: { attributes: [] },
          required: true,
        },
        {
          model: Media,
          as: "profileImage",
          attributes: ["id", "media_name", "path", "type"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  static async getAdmins(): Promise<User[]> {
    return await User.findAll({
      attributes: {
        exclude: USER_EXCLUDE_FIELDS,
      },
      where: {
        status: "active",
      },
      include: [
        {
          model: Role,
          as: "roles",
          where: { role_name: "Admin" },
          through: { attributes: [] },
          required: true,
        },
        {
          model: Media,
          as: "profileImage",
          attributes: ["id", "media_name", "path", "type"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  //--------------------------------
  // UPDATE USER
  //--------------------------------
  static async updateUser(
    id: string,
    data: any,
    requester: any,
    file?: Express.Multer.File,
  ): Promise<User> {
    const transaction = await sequelize.transaction();

    try {
      const user = await User.findByPk(id, {
        include: [
          {
            model: Role,
            as: "roles",
            through: { attributes: [] },
          },
        ],
        transaction,
      });

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      // Extract role_name and visibility fields separately — they need
      // special handling before being merged back into the update payload.
      const {
        role_name,
        visibility_mode,
        visibility_start_date,
        visibility_end_date,
        hide_guest_contacts,
        ...userData
      } = data;

      // Only Admin may grant/revoke a visibility window on another user.
      // Adjust `requester.role_name` below to however role is actually
      // exposed on req.user in your auth middleware.
      const isTouchingVisibility =
        Object.prototype.hasOwnProperty.call(data, "visibility_mode") ||
        Object.prototype.hasOwnProperty.call(data, "visibility_start_date") ||
        Object.prototype.hasOwnProperty.call(data, "visibility_end_date");

      // Only Admin may toggle whether a user's guest-contact view is restricted.
      const isTouchingContactVisibility = Object.prototype.hasOwnProperty.call(
        data,
        "hide_guest_contacts",
      );

      const requesterRoleName = requester?.roles?.[0]?.role_name;

      if (isTouchingVisibility && requesterRoleName !== "Admin") {
        throw new ApiError(
          403,
          "Only Admin can modify a user's visibility settings",
        );
      }

      if (isTouchingContactVisibility && requesterRoleName !== "Admin") {
        throw new ApiError(
          403,
          "Only Admin can modify a user's guest contact visibility",
        );
      }

      // Resolve the role this user will have AFTER this update
      const effectiveRoleName = role_name ?? user.roles?.[0]?.role_name ?? null;
      const isRestrictedRole = RESTRICTED_ROLES.includes(effectiveRoleName);

      if (isTouchingContactVisibility) {
        userData.hide_guest_contacts = hide_guest_contacts;
      }

      if (!isRestrictedRole) {
        // Admin (or a role change into Admin) is always unrestricted —
        // strip any stale visibility settings.
        userData.visibility_mode = "default";
        userData.visibility_start_date = null;
        userData.visibility_end_date = null;
      } else {
        // Staff/Host: only touch these fields if explicitly present in
        // the payload, so a partial update doesn't accidentally wipe an
        // existing window or mode.
        const isTouchingMode = Object.prototype.hasOwnProperty.call(
          data,
          "visibility_mode",
        );

        if (isTouchingMode) {
          const nextMode = VISIBILITY_MODES.includes(visibility_mode)
            ? visibility_mode
            : "default";

          userData.visibility_mode = nextMode;

          if (nextMode === "range") {
            // Trust validation to have required start_date; end may be
            // explicitly null (open-ended: start through now).
            userData.visibility_start_date =
              Object.prototype.hasOwnProperty.call(
                data,
                "visibility_start_date",
              )
                ? visibility_start_date
                : user.visibility_start_date;
            userData.visibility_end_date = Object.prototype.hasOwnProperty.call(
              data,
              "visibility_end_date",
            )
              ? visibility_end_date
              : null;
          } else {
            // "default" or "all" -> actively clear any previously
            // granted window.
            userData.visibility_start_date = null;
            userData.visibility_end_date = null;
          }
        } else {
          // Mode not being changed this request, but dates might still
          // be touched directly (e.g. adjusting an existing range
          // in-place without resending mode). Only meaningful if the
          // user is currently in "range" mode.
          if (
            Object.prototype.hasOwnProperty.call(data, "visibility_start_date")
          ) {
            userData.visibility_start_date = visibility_start_date;
          }
          if (
            Object.prototype.hasOwnProperty.call(data, "visibility_end_date")
          ) {
            userData.visibility_end_date = visibility_end_date;
          }
        }
      }

      // Role change
      if (role_name) {
        const role = await Role.findOne({
          where: { role_name },
          transaction,
        });

        if (!role) {
          throw new ApiError(404, "Role not found");
        }

        // Replace old roles
        await user.setRoles([role], { transaction });
      }

      let mediaId = user.profile_image;

      if (file) {
        const originalName = file.originalname;
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
        const sanitizedMediaName = nameWithoutExt
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");
        const mediaPath = `/uploads/media/${file.filename}`;

        const media = await Media.create(
          {
            media_name: sanitizedMediaName,
            path: mediaPath,
            type: file.mimetype,
            created_by: user.id,
            updated_by: user.id,
          },
          { transaction },
        );

        mediaId = media.id;
      } else if (data.tag_id && user.profile_image) {
        await Media.update(
          {
            tag_id: data.tag_id,
            updated_by: null,
          },
          { where: { id: user.profile_image }, transaction },
        );
      }

      // Single update call — was previously called twice (once without
      // profile_image, once with), which was a redundant extra write.
      await user.update(
        { ...userData, profile_image: mediaId },
        { transaction },
      );

      await transaction.commit();

      return user;
    } catch (error) {
      if (file) {
        const fs = await import("fs");
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
      await transaction.rollback();
      throw error;
    }
  }

  //--------------------------------
  // DELETE USER
  //--------------------------------
  static async deleteUser(
    targetUserId: string,
    currentUserId: string,
  ): Promise<void> {
    if (targetUserId === currentUserId) {
      throw new ApiError(403, "You cannot delete your own account");
    }

    const user = await User.findByPk(targetUserId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await user.destroy();
  }
}

export default UserService;
