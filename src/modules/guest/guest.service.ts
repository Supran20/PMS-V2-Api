import { sequelize } from "../../config/db";
import { Transaction } from "sequelize";
import Guest from "./guest.model";
import User from "../users/user.model";
import Role from "../roles/role.model";
import { sendEmail } from "../../services/email.service";
import ApiError from "../../middleware/error-handlers/ApiError";
import { GuestAttributes } from "./guest.interface";
import Media from "../media/media.model";

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
      const existingSlug = await Guest.findOne({
        where: { slug: data.slug },
        transaction,
      });

      if (existingSlug) {
        throw new ApiError(400, "Slug already exists");
      }

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
            tag_id: data.tag_id ?? null,
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
      // 3️⃣ Auto-approval logic
      // --------------------------------
      // const userPermissions = new Set(
      //   creator.roles?.flatMap(
      //     (role: any) =>
      //       role.permissions?.map((p: any) => p.permission_type) ?? [],
      //   ),
      // );

      // const autoApprove = userPermissions.has("guest.auto_approve");

      // --------------------------------
      // 4️⃣ Detect Host Role
      // --------------------------------
      const isHost = creator.roles?.some(
        (role: any) => role.role_name === "Host",
      );

      let hostId: string | null = null;

      if (isHost) {
        // Host creating → auto assign
        hostId = creator.id;
      } else {
        // Non-host creating → host_id must be provided
        if (!data.host_id) {
          throw new ApiError(400, "host_id is required");
        }

        // Validate host exists
        const hostUser = await User.findOne({
          where: { id: data.host_id },
          include: [
            {
              model: Role,
              as: "roles",
              where: { role_name: "Host" }, // 🔥 important
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

      // --------------------------------
      // 4️⃣ Create Guest
      // --------------------------------
      const guest = await Guest.create(
        {
          ...data,
          profile_image: mediaId,
          host_id: hostId,
          // approved: autoApprove,
          // approved_by: autoApprove ? creator.id : null,
          referred_by: data.referred_by ?? creator.id,
          created_by: creator.id,
          updated_by: creator.id,
        },
        { transaction },
      );

      await transaction.commit();

      // --------------------------------
      // 5️⃣ Notify Admins if needed
      // --------------------------------
      // if (!autoApprove) {
      //   const admins = await User.findAll({
      //     include: [
      //       {
      //         model: Role,
      //         as: "roles",
      //         where: { role_name: "Admin" },
      //         through: { attributes: [] },
      //       },
      //     ],
      //   });

      //   for (const admin of admins) {
      //     if (admin.email) {
      //       await sendEmail(
      //         admin.email,
      //         "Guest Approval Required",
      //         `A new guest "${guest.full_name}" requires approval.`,
      //       );
      //     }
      //   }
      // }

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
  static async getAllGuests(): Promise<Guest[]> {
    return await Guest.findAll({
      order: [["full_name", "ASC"]],
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
  }

  //--------------------------------
  // GET Guest by ID
  //--------------------------------
  static async getGuestById(id: string): Promise<Guest> {
    const guest = await Guest.findByPk(id);

    if (!guest) {
      throw new ApiError(404, "Guest not found");
    }

    return guest;
  }

  //--------------------------------
  // GET Guest by Slug
  //--------------------------------
  static async getGuestBySlug(slug: string): Promise<Guest> {
    const guest = await Guest.findOne({
      where: { slug },
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

    if (!guest) {
      throw new ApiError(404, "Guest not found");
    }

    return guest;
  }

  //--------------------------------
  // APPROVE Guest
  //--------------------------------
  static async approveGuest(id: string, approver: any): Promise<Guest> {
    const guest = await Guest.findByPk(id);

    if (!guest) {
      throw new ApiError(404, "Guest not found");
    }

    if (guest.approved) {
      throw new ApiError(400, "Guest already approved");
    }

    const isAdmin = approver.roles?.some(
      (role: any) => role.role_name === "Admin",
    );

    if (!isAdmin) {
      throw new ApiError(403, "Only Admin can approve guest");
    }

    await guest.update({
      approved: true,
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
      const guest = await Guest.findOne({
        where: { slug },
        transaction,
      });

      if (!guest) {
        throw new ApiError(404, "Guest not found");
      }

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
            tag_id: data.tag_id ?? null,
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

      // Prevent manual override

      if ("approved" in data) {
        delete data.approved;
      }

      // Validate host_id if provided
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
  static async deleteGuest(id: string): Promise<void> {
    const guest = await Guest.findByPk(id);

    if (!guest) {
      throw new ApiError(404, "Guest not found");
    }

    await guest.destroy();
  }
}

export default GuestService;
