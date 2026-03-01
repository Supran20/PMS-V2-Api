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

      // --------------------------------
      // 3️⃣ Auto-approval logic
      // --------------------------------
      const userPermissions = new Set(
        creator.roles?.flatMap(
          (role: any) =>
            role.permissions?.map((p: any) => p.permission_type) ?? [],
        ),
      );

      const autoApprove = userPermissions.has("guest.auto_approve");

      // --------------------------------
      // 4️⃣ Create Guest
      // --------------------------------
      const guest = await Guest.create(
        {
          ...data,
          profile_image: mediaId,
          approved: autoApprove,
          approved_by: autoApprove ? creator.id : null,
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
      if (!autoApprove) {
        const admins = await User.findAll({
          include: [
            {
              model: Role,
              as: "roles",
              where: { role_name: "Admin" },
              through: { attributes: [] },
            },
          ],
        });

        for (const admin of admins) {
          if (admin.email) {
            await sendEmail(
              admin.email,
              "Guest Approval Required",
              `A new guest "${guest.full_name}" requires approval.`,
            );
          }
        }
      }

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
          attributes: ["id", "media_name", "path", "type"],
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
          attributes: ["id", "media_name", "path", "type"],
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
      }

      // Prevent manual override
      if ("approved" in data) {
        delete data.approved;
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
