import { sequelize } from "../../../config/db";
import { Transaction } from "sequelize";
import PermissionSettings from "./permission_set.model";
import ApiError from "../../../middleware/error-handlers/ApiError";
import User from "../../users/user.model";

class PermissionSettingsService {
  //--------------------------------
  // CREATE
  //--------------------------------
  static async create(data: any, userId?: string): Promise<PermissionSettings> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      const permission = await PermissionSettings.create(
        {
          ...data,
          created_by: userId ?? null,
          updated_by: userId ?? null,
        },
        { transaction },
      );

      await transaction.commit();
      return permission;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //--------------------------------
  // GET ALL
  //--------------------------------
  static async getAll(): Promise<any[]> {
    const permissions = await PermissionSettings.findAll({
      order: [["created_at", "DESC"]],
    });

    // 🔥 Attach user details
    return await Promise.all(
      permissions.map(async (perm) => {
        const users = await User.findAll({
          where: { id: perm.user_ids },
          attributes: ["id", "full_name", "email"],
        });

        return {
          ...perm.toJSON(),
          users,
        };
      }),
    );
  }

  //--------------------------------
  // GET BY ID
  //--------------------------------
  static async getById(id: string): Promise<any> {
    const permission = await PermissionSettings.findByPk(id);

    if (!permission) {
      throw new ApiError(404, "Permission settings not found");
    }

    const users = await User.findAll({
      where: { id: permission.user_ids },
      attributes: ["id", "full_name", "email"],
    });

    return {
      ...permission.toJSON(),
      users,
    };
  }

  //--------------------------------
  // UPDATE
  //--------------------------------
  static async update(
    id: string,
    data: any,
    userId?: string,
  ): Promise<PermissionSettings> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      const permission = await PermissionSettings.findByPk(id, {
        transaction,
      });

      if (!permission) {
        throw new ApiError(404, "Permission settings not found");
      }

      await permission.update(
        {
          ...data,
          updated_by: userId ?? null,
        },
        { transaction },
      );

      await transaction.commit();
      return permission;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //--------------------------------
  // DELETE
  //--------------------------------
  static async delete(id: string): Promise<void> {
    const permission = await PermissionSettings.findByPk(id);

    if (!permission) {
      throw new ApiError(404, "Permission settings not found");
    }

    await permission.destroy();
  }
}

export default PermissionSettingsService;
