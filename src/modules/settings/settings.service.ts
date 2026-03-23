import { sequelize } from "../../config/db";
import { Transaction } from "sequelize";
import Settings from "./settings.model";
import ApiError from "../../middleware/error-handlers/ApiError";

class SettingsService {
  //--------------------------------
  // CREATE SETTINGS
  //--------------------------------
  static async createSettings(data: any, userId?: string): Promise<Settings> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      const settings = await Settings.create(
        {
          ...data,
          created_by: userId ?? null,
          updated_by: userId ?? null,
        },
        { transaction },
      );

      await transaction.commit();
      return settings;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //--------------------------------
  // GET ALL SETTINGS
  //--------------------------------
  static async getAllSettings(): Promise<Settings[]> {
    return await Settings.findAll({
      order: [["created_at", "DESC"]],
    });
  }

  //--------------------------------
  // GET SETTINGS BY ID
  //--------------------------------
  static async getSettingsById(id: string): Promise<Settings> {
    const settings = await Settings.findByPk(id);

    if (!settings) {
      throw new ApiError(404, "Settings not found");
    }

    return settings;
  }

  //--------------------------------
  // GET SETTINGS BY TYPE
  //--------------------------------
  static async getSettingsByType(type: string): Promise<Settings> {
    const settings = await Settings.findOne({ where: { type } });

    if (!settings) {
      throw new ApiError(404, "Settings not found");
    }

    return settings;
  }

  //--------------------------------
  // UPDATE SETTINGS
  //--------------------------------
  static async updateSettings(
    id: string,
    data: any,
    userId?: string,
  ): Promise<Settings> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      const settings = await Settings.findByPk(id, { transaction });

      if (!settings) {
        throw new ApiError(404, "Settings not found");
      }

      await settings.update(
        {
          ...data,
          updated_by: userId ?? null,
        },
        { transaction },
      );

      await transaction.commit();
      return settings;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //--------------------------------
  // DELETE SETTINGS
  //--------------------------------
  static async deleteSettings(id: string): Promise<void> {
    const settings = await Settings.findByPk(id);

    if (!settings) {
      throw new ApiError(404, "Settings not found");
    }

    await settings.destroy();
  }
}

export default SettingsService;
