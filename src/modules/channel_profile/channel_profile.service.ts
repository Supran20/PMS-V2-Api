import fs from "fs";
import path from "path";
import { sequelize } from "../../config/db";
import Channel from "../admin/channel/channel.model";
import { ChannelSocialLinks } from "../admin/channel/channel.interface";
import Media from "../media/media.model";
import ApiError from "../../middleware/error-handlers/ApiError";
import { UpdateMyChannelInput } from "./channel_profile.validation";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

// ASSUMPTIONS: match how UserService stores profile image Media rows.
const toStoredPath = (filename: string) => `/uploads/media/${filename}`;
const LOGO_MEDIA_TYPE = "image";

// Delete a stored file, but only if it really lives under /uploads.
const removeStoredFile = async (storedPath: string) => {
  const absolute = path.resolve(
    process.cwd(),
    storedPath.replace(/^[/\\]+/, ""),
  );
  if (!absolute.startsWith(UPLOADS_ROOT + path.sep)) return;

  try {
    await fs.promises.unlink(absolute);
  } catch {
    // already gone: nothing to clean up
  }
};

class ChannelProfileService {
  //--------------------------------
  // Branding (used here and by /auth/me)
  //--------------------------------
  static async getProfile(channelId: string) {
    const channel = await Channel.findByPk(channelId, {
      attributes: [
        "id",
        "channel_name",
        "slug",
        "description",
        "social_links",
        "logo_media_id",
      ],
    });

    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }

    // The media id comes from the channel's own row, so this is already an
    // exact lookup. bypassTenantScope because /auth/me runs without a
    // tenant context.
    const logo = channel.logo_media_id
      ? await Media.findByPk(channel.logo_media_id, {
          attributes: ["id", "media_name", "path", "type"],
          bypassTenantScope: true,
        } as any)
      : null;

    return {
      id: channel.id,
      channel_name: channel.channel_name,
      slug: channel.slug,
      description: channel.description,
      social_links: channel.social_links ?? {},
      logo: logo ? logo.toJSON() : null,
    };
  }

  //--------------------------------
  // UPDATE name / description / links
  //--------------------------------
  static async updateProfile(
    channelId: string,
    data: UpdateMyChannelInput,
    updaterId: string,
  ) {
    const channel = await Channel.findByPk(channelId);

    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }

    // Deliberately NO assertNotDefaultChannel here: the default channel's
    // own users may brand it. Slug, status and plan are never touched.
    const updates: {
      channel_name: string;
      updated_by: string;
      description?: string | null;
      social_links?: ChannelSocialLinks | null;
    } = {
      channel_name: data.channel_name,
      updated_by: updaterId,
    };

    if (data.description !== undefined) {
      updates.description = data.description;
    }

    if (data.social_links !== undefined) {
      const cleaned = Object.fromEntries(
        Object.entries(data.social_links).filter(([, value]) => !!value),
      ) as ChannelSocialLinks;

      updates.social_links = Object.keys(cleaned).length ? cleaned : null;
    }

    await channel.update(updates);

    return ChannelProfileService.getProfile(channelId);
  }

  //--------------------------------
  // SET logo (replaces the old one)
  //--------------------------------
  static async setLogo(
    channelId: string,
    file: Express.Multer.File,
    userId: string,
  ) {
    const transaction = await sequelize.transaction();
    let oldLogoPath: string | null = null;

    try {
      const channel = await Channel.findByPk(channelId, { transaction });

      if (!channel) {
        throw new ApiError(404, "Channel not found");
      }

      const oldLogo = channel.logo_media_id
        ? await Media.findByPk(channel.logo_media_id, { transaction })
        : null;

      const media = await Media.create(
        {
          channel_id: channel.id,
          media_name: file.originalname,
          path: toStoredPath(file.filename),
          type: LOGO_MEDIA_TYPE,
          created_by: userId,
          updated_by: userId,
        },
        { transaction },
      );

      // Point the channel at the new logo first, then drop the old row.
      await channel.update(
        { logo_media_id: media.id, updated_by: userId },
        { transaction },
      );

      if (oldLogo) {
        oldLogoPath = oldLogo.path;
        await oldLogo.destroy({ transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      // multer already wrote the new file to disk
      await fs.promises.unlink(file.path).catch(() => undefined);
      throw error;
    }

    if (oldLogoPath) {
      await removeStoredFile(oldLogoPath);
    }

    return ChannelProfileService.getProfile(channelId);
  }

  //--------------------------------
  // REMOVE logo
  //--------------------------------
  static async removeLogo(channelId: string, userId: string) {
    const transaction = await sequelize.transaction();
    let oldLogoPath: string | null = null;

    try {
      const channel = await Channel.findByPk(channelId, { transaction });

      if (!channel) {
        throw new ApiError(404, "Channel not found");
      }

      const oldLogo = channel.logo_media_id
        ? await Media.findByPk(channel.logo_media_id, { transaction })
        : null;

      await channel.update(
        { logo_media_id: null, updated_by: userId },
        { transaction },
      );

      if (oldLogo) {
        oldLogoPath = oldLogo.path;
        await oldLogo.destroy({ transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    if (oldLogoPath) {
      await removeStoredFile(oldLogoPath);
    }

    return ChannelProfileService.getProfile(channelId);
  }
}

export default ChannelProfileService;
