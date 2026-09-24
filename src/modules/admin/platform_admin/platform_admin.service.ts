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

      const existingEmail = await User.findOne({
        where: { email: data.email },
        transaction,
      });

      if (existingEmail) {
        throw new ApiError(400, "Email already exists");
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await User.create(
        {
          full_name: data.full_name,
          email: data.email,
          password: hashedPassword,
          mobile_number: data.mobile_number ?? null,
          status: "active",
          channel_id: defaultChannel.id,
        },
        { transaction },
      );

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
            channel_id: defaultChannel.id,
            created_by: creatorId,
            updated_by: creatorId,
          },
          { transaction },
        );

        user.profile_image = media.id;
        await user.save({ transaction });
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
}

export default PlatformAdminService;
