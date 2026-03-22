import bcrypt from "bcryptjs";
import { sequelize } from "../../config/db";
import { Transaction } from "sequelize";
import User from "./user.model";
import Role from "../roles/role.model";
import ApiError from "../../middleware/error-handlers/ApiError";
import { UserAttributes } from "./user.interface";
import Media from "../media/media.model";

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

      const user = await User.create(
        {
          ...data,
          password: hashedPassword,
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
      where: {
        status: "active",
      },
      include: [
        {
          model: Role,
          as: "roles",
          where: { role_name: "Host" },
          through: { attributes: [] },
          required: true, // ensures INNER JOIN (only users with Host role)
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
      where: {
        status: "active",
      },
      include: [
        {
          model: Role,
          as: "roles",
          where: { role_name: "Admin" },
          through: { attributes: [] },
          required: true, // ensures INNER JOIN (only users with Host role)
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
    user: any,
    file?: Express.Multer.File,
  ): Promise<User> {
    const transaction = await sequelize.transaction();

    try {
      const user = await User.findByPk(id, { transaction });

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      // Extract role_name separately
      const { role_name, ...userData } = data;

      // Update normal user fields
      await user.update(userData, { transaction });

      // If role needs updating
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
