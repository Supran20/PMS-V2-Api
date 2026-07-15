import { sequelize } from "../../config/db";
import { Transaction, Op } from "sequelize";
import Guest from "./guest.model";
import Interview from "../interview/interview.model";
import User from "../users/user.model";
import Role from "../roles/role.model";
import { sendEmail } from "../../services/email.service";
import ApiError from "../../middleware/error-handlers/ApiError";
import { GuestAttributes } from "./guest.interface";
import Media from "../media/media.model";
import GuestNote from "../guest_note/guest_note.model";
import { generateGuestApprovalEmailHtml } from "../../services/email.service";
import { generateGuestStatusEmailHtml } from "../../services/email.service";
import { generateUniqueSlug } from "../../utils/slugify";
import PermissionSettings from "../settings/permission_settings/permission_set.model";
import eventBus from "../../events/eventBus";
import { EVENTS } from "../../events/events.constants";
import Tags from "../tags/tags.model";
import {
  getVisibilityFilter,
  mergeVisibilityFilter,
  VisibilitySubject,
} from "../../utils/visibility.util";

// Builds the VisibilitySubject shape from a req.user instance.
// Centralized here so both getAllGuests/getGuestById/getGuestBySlug
// (and interview.service.ts) build it the same way.
function toVisibilitySubject(requester: any): VisibilitySubject {
  return {
    id: requester?.id,
    role_name: requester?.roles?.[0]?.role_name ?? null,
    created_at: requester?.created_at,
    visibility_mode: requester?.visibility_mode ?? "default",
    visibility_start_date: requester?.visibility_start_date ?? null,
    visibility_end_date: requester?.visibility_end_date ?? null,
  };
}

// For a Host, resolves the guest ids they're indirectly assigned to via
// an Interview (i.e. guests they've interviewed but don't directly own
// via Guest.host_id). OR'd into the visibility filter as a bonus grant —
// never a restriction — alongside direct host_id assignment and the
// time-based window.
async function getHostAssignedGuestIds(
  requesterId: string,
  transaction?: Transaction,
): Promise<string[]> {
  const hostInterviews = await Interview.findAll({
    where: { host_id: requesterId },
    attributes: ["guest_id"],
    transaction,
  });
  return hostInterviews.map((i: any) => i.guest_id);
}

// Builds the fully merged where-clause for guest queries, honoring:
//  - time-based visibility (default/range/all, per requester.visibility_mode)
//  - direct assignment (Guest.host_id === requester.id), Host only
//  - indirect assignment (guest ids reached via Interview), Host only
// Admin and "all"-mode Host/Staff get back the original baseWhere
// untouched, since getVisibilityFilter returns null for them.
async function buildGuestVisibilityWhere(
  baseWhere: Record<string, any>,
  requester: any,
  transaction?: Transaction,
): Promise<Record<string, any>> {
  const isHost = requester?.roles?.[0]?.role_name === "Host";

  let assignmentIds: string[] | undefined;
  if (isHost) {
    assignmentIds = await getHostAssignedGuestIds(requester.id, transaction);
  }

  const visibilityFilter = getVisibilityFilter(toVisibilitySubject(requester), {
    assignmentField: "host_id",
    assignmentIds,
  });

  return mergeVisibilityFilter(baseWhere, visibilityFilter);
}

// Shared helper: fetch a single guest by an arbitrary where-clause,
// honoring the requester's visibility settings, or throw 404.
async function findVisibleGuestOrThrow(
  baseWhere: Record<string, any>,
  requester: any,
  transaction?: Transaction,
  include?: any[],
): Promise<Guest> {
  const where = await buildGuestVisibilityWhere(
    baseWhere,
    requester,
    transaction,
  );

  const guest = await Guest.findOne({ where, transaction, include });
  if (!guest) throw new ApiError(404, "Guest not found");
  return guest;
}

class GuestService {
  //--------------------------------
  // CREATE Guest
  //--------------------------------
  static async createGuest(
    data: any,
    creator: any,
    file?: Express.Multer.File,
  ): Promise<Guest> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      // --------------------------------
      // 1️⃣ Check slug uniqueness
      // --------------------------------
      const slug = await generateUniqueSlug(data.full_name, Guest, transaction);

      // --------------------------------
      // 2️⃣ Create Media (if file uploaded)
      // --------------------------------
      let mediaId: string | null = null;

      if (file) {
        // Generate clean media name from original filename
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

        mediaId = media.id;
      }

      if (data.social_media && typeof data.social_media === "string") {
        try {
          data.social_media = JSON.parse(data.social_media);
        } catch (err) {
          throw new ApiError(400, "Invalid social_media JSON format");
        }
      }

      // --------------------------------
      // 4️⃣ Detect Host Role
      // --------------------------------
      const isHost = creator.roles?.some(
        (role: any) => role.role_name === "Host",
      );

      let hostId: string | null = null;

      if (isHost) {
        hostId = creator.id;
      } else if (data.host_id) {
        const hostUser = await User.findOne({
          where: { id: data.host_id },
          include: [
            {
              model: Role,
              as: "roles",
              where: { role_name: "Host" },
              through: { attributes: [] },
            },
          ],
          transaction,
        });

        if (!hostUser) {
          throw new ApiError(400, "Invalid host_id");
        }

        // Ensure provided user actually has Host role
        const isProvidedUserHost = hostUser.roles?.some(
          (role: any) => role.role_name === "Host",
        );

        if (!isProvidedUserHost) {
          throw new ApiError(
            400,
            "Provided host_id does not belong to a Host user",
          );
        }

        hostId = data.host_id;
      }

      if (data.notes && typeof data.notes === "string") {
        try {
          data.notes = JSON.parse(data.notes);
        } catch (err) {
          throw new ApiError(400, "Invalid notes JSON format");
        }
      }

      delete data.slug;

      // --------------------------------
      // 4️⃣ Create Guest
      // --------------------------------
      const guest = await Guest.create(
        {
          ...data,
          slug,
          profile_image: mediaId,
          host_id: hostId,
          status: data.status ?? "not_started",
          tag_ids: data.tag_ids ?? [],
          referred_by: data.referred_by ?? creator.id,
          created_by: creator.id,
          updated_by: creator.id,
        },
        { transaction },
      );

      await transaction.commit();

      eventBus.emit(EVENTS.GUEST_CREATED, {
        guestId: guest.id,
        guestName: guest.full_name,
        creatorName: creator.full_name,
      });

      return guest;
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
  // GET All Guests
  //--------------------------------
  static async getAllGuests(requester: any): Promise<any[]> {
    const where = await buildGuestVisibilityWhere({}, requester);

    const guests = await Guest.findAll({
      where,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Media,
          as: "profileImage",
          attributes: ["id", "media_name", "path", "type", "tag_id"],
        },
        {
          model: User,
          as: "referrer",
          attributes: ["id", "full_name"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "full_name"],
        },
        {
          model: User,
          as: "host",
          attributes: ["id", "full_name"],
        },
      ],
    });

    // 🔥 manually attach tags
    const guestsWithTags = await Promise.all(
      guests.map(async (guest) => {
        const tagIds = guest.tag_ids || [];

        const tags = await Tags.findAll({
          where: { id: tagIds },
          attributes: ["id", "tag_name", "slug"],
        });

        return {
          ...guest.toJSON(),
          tags_data: tags,
        };
      }),
    );

    return guestsWithTags;
  }

  //--------------------------------
  // GET Guest by ID
  //--------------------------------
  static async getGuestById(id: string, requester: any): Promise<Guest> {
    const where = await buildGuestVisibilityWhere({ id }, requester);

    const guest = await Guest.findOne({ where });

    if (!guest) {
      // Same 404 whether it doesn't exist or is just outside the
      // requester's visibility settings — don't leak existence.
      throw new ApiError(404, "Guest not found");
    }

    return guest;
  }

  //--------------------------------
  // GET Guest by Slug
  //--------------------------------
  static async getGuestBySlug(slug: string, requester: any): Promise<any> {
    const where = await buildGuestVisibilityWhere({ slug }, requester);

    const guest = await Guest.findOne({
      where,
      include: [
        {
          model: Media,
          as: "profileImage",
          attributes: ["id", "media_name", "path", "type", "tag_id"],
        },
        {
          model: User,
          as: "referrer",
          attributes: ["id", "full_name"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "full_name"],
        },
        {
          model: User,
          as: "host",
          attributes: ["id", "full_name"],
        },
      ],
    });

    if (!guest) throw new ApiError(404, "Guest not found");

    const tags = await Tags.findAll({
      where: { id: guest.tag_ids || [] },
      attributes: ["id", "tag_name", "slug"],
    });

    return {
      ...guest.toJSON(),
      tags_data: tags,
    };
  }

  //--------------------------------
  // APPROVE Guest
  //--------------------------------
  static async approveGuest(id: string, approver: any): Promise<Guest> {
    const guest = await findVisibleGuestOrThrow({ id }, approver, undefined, [
      { model: User, as: "host", attributes: ["full_name", "email"] },
    ]);

    if (guest.approved) {
      throw new ApiError(400, "Guest already approved");
    }

    const permission = await PermissionSettings.findOne({
      where: { permission_type: "guest_approver" },
    });

    const allowedUserIds = permission?.user_ids ?? [];

    if (!allowedUserIds.includes(approver.id)) {
      throw new ApiError(403, "You are not allowed to approve guest");
    }

    await guest.update({
      approved: true,
      approved_by: approver.id,
      updated_by: approver.id,
    });

    return guest;
  }

  //--------------------------------
  // Reject Guest
  //--------------------------------
  static async rejectGuest(id: string, approver: any): Promise<Guest> {
    const guest = await findVisibleGuestOrThrow({ id }, approver, undefined, [
      { model: User, as: "host", attributes: ["full_name", "email"] },
    ]);

    const permission = await PermissionSettings.findOne({
      where: { permission_type: "guest_approver" },
    });

    const allowedUserIds = permission?.user_ids ?? [];

    if (!allowedUserIds.includes(approver.id)) {
      throw new ApiError(403, "You are not allowed to reject guest");
    }

    await guest.update({
      rejected: true,
      approved: false,
      approved_by: approver.id,
      updated_by: approver.id,
    });

    return guest;
  }

  //--------------------------------
  // UPDATE Guest by Slug
  //--------------------------------
  static async updateGuestBySlug(
    slug: string,
    data: any,
    user: any,
    file?: Express.Multer.File,
  ): Promise<Guest> {
    const transaction = await sequelize.transaction();

    try {
      const guest = await findVisibleGuestOrThrow({ slug }, user, transaction);

      let mediaId = guest.profile_image;

      // --------------------------------
      // If new file uploaded
      // --------------------------------
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
      } else if (data.tag_id && guest.profile_image) {
        await Media.update(
          {
            tag_id: data.tag_id,
            updated_by: user.id,
          },
          {
            where: { id: guest.profile_image },
            transaction,
          },
        );
      }

      if ("approved" in data) {
        delete data.approved;
      }

      if (data.host_id) {
        const host = await User.findByPk(data.host_id, { transaction });

        if (!host) {
          throw new ApiError(400, "Invalid host_id");
        }
      }

      if (data.social_media && typeof data.social_media === "string") {
        try {
          data.social_media = JSON.parse(data.social_media);
        } catch (err) {
          throw new ApiError(400, "Invalid social_media JSON format");
        }
      }

      if (data.notes && typeof data.notes === "string") {
        try {
          data.notes = JSON.parse(data.notes);
        } catch (err) {
          throw new ApiError(400, "Invalid notes JSON format");
        }
      }

      await guest.update(
        {
          ...data,
          profile_image: mediaId,
          tag_ids: data.tag_ids ?? guest.tag_ids,
          updated_by: user.id,
        },
        { transaction },
      );

      await transaction.commit();

      return guest;
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
  // DELETE Guest
  //--------------------------------
  static async deleteGuest(id: string, requester: any): Promise<void> {
    const guest = await findVisibleGuestOrThrow({ id }, requester);
    await guest.destroy();
  }
}

export default GuestService;
