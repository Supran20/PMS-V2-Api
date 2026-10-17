import bcrypt from "bcryptjs";
import { Transaction } from "sequelize";
import { sequelize } from "../../../config/db";
import ApiError from "../../../middleware/error-handlers/ApiError";
import User from "../../users/user.model";
import Channel from "../channel/channel.model";
import PlatformAdmin from "./platform_admin.model";
import { PlatformAdminCreationAttributes } from "./platform_admin.interface";
import Media from "../../media/media.model";

const DEFAULT_CHANNEL_SLUG = "default";

// Never leak credential/OTP fields through the platform-admin API.
const USER_PUBLIC_ATTRIBUTES = [
  "id",
  "channel_id",
  "full_name",
  "email",
  "status",
  "mobile_number",
  "profile_image",
  "enable_otp_login",
  "otp_in_mail",
  "otp_in_sms",
];

const USER_INCLUDE = [
  {
    model: User,
    as: "user",
    attributes: USER_PUBLIC_ATTRIBUTES,
    include: [
      {
        model: Media,
        as: "profileImage",
        attributes: ["id", "media_name", "path", "type"],
      },
    ],
  },
];

export interface CreatePlatformAdminInput {
  full_name: string;
  email: string;
  password: string;
  mobile_number?: string | null;
  status?: "active" | "inactive";
  enable_otp_login?: boolean;
  otp_in_mail?: boolean;
  otp_in_sms?: boolean;
}

export interface UpdatePlatformAdminInput {
  full_name?: string;
  mobile_number?: string | null;
  password?: string;
  status?: "active" | "inactive";
  enable_otp_login?: boolean;
  otp_in_mail?: boolean;
  otp_in_sms?: boolean;
}

class PlatformAdminService {
  //--------------------------------
  // CREATE Platform Admin
  // Creates a brand-new User (in the Default Channel) + platform_admins row.
  //--------------------------------
  static async createPlatformAdmin(
    data: CreatePlatformAdminInput,
    creatorId: string,
    file?: Express.Multer.File,
  ): Promise<PlatformAdmin> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      const defaultChannel = await Channel.findOne({
        where: { slug: DEFAULT_CHANNEL_SLUG },
        transaction,
      });

      if (!defaultChannel) {
        throw new ApiError(
          500,
          "Default channel not found. Run the default channel seeder.",
        );
      }

      // bypassTenantScope: true — platform-wide route, no context yet, and
      // this is a genuinely global uniqueness check across all channels.
      const existingEmail = await User.findOne({
        where: { email: data.email },
        transaction,
        bypassTenantScope: true,
      });

      if (existingEmail) {
        throw new ApiError(400, "Email already exists");
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      // bypassTenantScope: true — channel_id is set explicitly below to the
      // Default Channel, so the hook has nothing to add and would otherwise
      // just throw for lack of context.
      const user = await User.create(
        {
          full_name: data.full_name,
          email: data.email,
          password: hashedPassword,
          mobile_number: data.mobile_number ?? null,
          channel_id: defaultChannel.id,
          status: data.status ?? "active",
          enable_otp_login: data.enable_otp_login ?? false,
          otp_in_mail: data.enable_otp_login ? !!data.otp_in_mail : false,
          otp_in_sms: data.enable_otp_login ? !!data.otp_in_sms : false,
        },
        { transaction, bypassTenantScope: true },
      );

      if (file) {
        const originalName = file.originalname;
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
        const sanitizedMediaName = nameWithoutExt
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");
        const mediaPath = `/uploads/media/${file.filename}`;

        // bypassTenantScope: true — same reasoning as the User.create above;
        // channel_id is explicit (Default Channel), no context exists here.
        const media = await Media.create(
          {
            media_name: sanitizedMediaName,
            path: mediaPath,
            type: file.mimetype,
            channel_id: defaultChannel.id,
            created_by: creatorId,
            updated_by: creatorId,
          },
          { transaction, bypassTenantScope: true },
        );

        user.profile_image = media.id;
        await user.save({ transaction, bypassTenantScope: true });
      }

      const creationData: PlatformAdminCreationAttributes = {
        user_id: user.id,
        created_by: creatorId,
        updated_by: creatorId,
      };

      const platformAdmin = await PlatformAdmin.create(creationData, {
        transaction,
      });

      await transaction.commit();

      return await this.getPlatformAdminById(platformAdmin.id);
    } catch (error) {
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
  // GET All Platform Admins
  //--------------------------------
  static async getAllPlatformAdmins(): Promise<PlatformAdmin[]> {
    return await PlatformAdmin.findAll({
      include: USER_INCLUDE,
      order: [["created_at", "DESC"]],
    });
  }

  //--------------------------------
  // GET Platform Admin by ID
  //--------------------------------
  static async getPlatformAdminById(id: string): Promise<PlatformAdmin> {
    const platformAdmin = await PlatformAdmin.findByPk(id, {
      include: USER_INCLUDE,
    });

    if (!platformAdmin) {
      throw new ApiError(404, "Platform admin not found");
    }

    return platformAdmin;
  }

  //--------------------------------
  // DELETE (revoke) Platform Admin
  // Only removes platform access; the User row is kept.
  //--------------------------------
  static async deletePlatformAdmin(
    id: string,
    requesterId: string,
  ): Promise<void> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      // Lock all rows so two concurrent revokes can't both pass the
      // last-admin check. (FOR UPDATE can't be combined with COUNT(*)
      // in Postgres, so we lock the rows via findAll instead.)
      const admins = await PlatformAdmin.findAll({
        attributes: ["id", "user_id"],
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      const target = admins.find((admin) => admin.id === id);

      if (!target) {
        throw new ApiError(404, "Platform admin not found");
      }

      if (target.user_id === requesterId) {
        throw new ApiError(
          403,
          "You cannot revoke your own platform admin access",
        );
      }

      if (admins.length <= 1) {
        throw new ApiError(
          400,
          "Cannot remove the last remaining platform admin",
        );
      }

      await PlatformAdmin.destroy({ where: { id }, transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //--------------------------------
  // UPDATE Platform Admin
  // Updates the linked User's profile fields (+ optional new profile image).
  //--------------------------------
  static async updatePlatformAdmin(
    id: string,
    data: UpdatePlatformAdminInput,
    updaterId: string,
    file?: Express.Multer.File,
  ): Promise<PlatformAdmin> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      const platformAdmin = await PlatformAdmin.findByPk(id, { transaction });

      if (!platformAdmin) {
        throw new ApiError(404, "Platform admin not found");
      }

      // bypassTenantScope: true — platform-wide route, no channel context.
      const user = await User.findByPk(platformAdmin.user_id, {
        transaction,
        bypassTenantScope: true,
      });

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      if (data.status === "inactive" && platformAdmin.user_id === updaterId) {
        throw new ApiError(403, "You cannot deactivate your own account");
      }

      if (data.full_name !== undefined) {
        user.full_name = data.full_name;
      }

      if (data.mobile_number !== undefined) {
        user.mobile_number = data.mobile_number || null;
      }

      if (data.status !== undefined) {
        user.status = data.status;
      }

      // Password reset: also drop any "remember me" session
      if (data.password) {
        user.password = await bcrypt.hash(data.password, 10);
        user.remember_until = null;
      }

      // OTP settings, validated against the FINAL state
      const finalOtp = data.enable_otp_login ?? user.enable_otp_login;

      if (finalOtp) {
        const finalMail = data.otp_in_mail ?? user.otp_in_mail;
        const finalSms = data.otp_in_sms ?? user.otp_in_sms;

        if (!!finalMail === !!finalSms) {
          throw new ApiError(
            400,
            "Select exactly one OTP method (Email or SMS)",
          );
        }
        if (finalSms && !user.mobile_number) {
          throw new ApiError(400, "Mobile number is required for SMS OTP");
        }

        user.enable_otp_login = true;
        user.otp_in_mail = !!finalMail;
        user.otp_in_sms = !!finalSms;
      } else {
        user.enable_otp_login = false;
        user.otp_in_mail = false;
        user.otp_in_sms = false;
      }

      // Clear stale OTP/session state when OTP is off or the account is inactive
      if (!user.enable_otp_login || user.status === "inactive") {
        user.otp = null;
        user.otp_expires_at = null;
        user.remember_until = null;
      }

      if (file) {
        const nameWithoutExt = file.originalname.replace(/\.[^/.]+$/, "");
        const sanitizedMediaName = nameWithoutExt
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");

        // channel_id is explicit (the user's own channel), so bypass is safe.
        const media = await Media.create(
          {
            media_name: sanitizedMediaName,
            path: `/uploads/media/${file.filename}`,
            type: file.mimetype,
            channel_id: user.channel_id,
            created_by: updaterId,
            updated_by: updaterId,
          },
          { transaction, bypassTenantScope: true },
        );

        user.profile_image = media.id;
      }

      await user.save({ transaction, bypassTenantScope: true });

      platformAdmin.updated_by = updaterId;
      await platformAdmin.save({ transaction });

      await transaction.commit();
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

    // Outside the try so a failure here can't trigger a rollback on an
    // already-committed transaction.
    return await this.getPlatformAdminById(id);
  }
}

export default PlatformAdminService;
