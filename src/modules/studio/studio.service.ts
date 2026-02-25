import { sequelize } from "../../config/db";
import { Transaction } from "sequelize";
import Studio from "./studio.model";
import ApiError from "../../middleware/error-handlers/ApiError";
import { StudioAttributes, StudioCreationAttributes } from "./studio.interface";

class StudioService {
  //--------------------------------
  // CREATE Studio
  //--------------------------------
  static async createStudio(
    data: StudioCreationAttributes,
    creatorId: string,
  ): Promise<Studio> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      const existing = await Studio.findOne({
        where: { studio_name: data.studio_name },
        transaction,
      });

      if (existing) {
        throw new ApiError(400, "Studio name already exists");
      }

      const studio = await Studio.create(
        {
          ...data,
          created_by: creatorId,
          updated_by: creatorId,
        },
        { transaction },
      );

      await transaction.commit();
      return studio;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //--------------------------------
  // GET All Studios
  //--------------------------------
  static async getAllStudios(): Promise<Studio[]> {
    return await Studio.findAll({
      order: [["created_at", "DESC"]],
    });
  }

  //--------------------------------
  // GET Studio by ID
  //--------------------------------
  static async getStudioById(id: string): Promise<Studio> {
    const studio = await Studio.findByPk(id);

    if (!studio) {
      throw new ApiError(404, "Studio not found");
    }

    return studio;
  }

  //--------------------------------
  // GET Studio by Slug
  //--------------------------------
  static async getStudioBySlug(slug: string): Promise<Studio> {
    const studio = await Studio.findOne({
      where: { slug },
    });

    if (!studio) {
      throw new ApiError(404, "Studio not found");
    }

    return studio;
  }

  //--------------------------------
  // UPDATE Studio by Slug
  //--------------------------------
  static async updateStudioBySlug(
    slug: string,
    data: Partial<StudioAttributes>,
    updaterId: string,
  ): Promise<Studio> {
    const studio = await Studio.findOne({
      where: { slug },
    });

    if (!studio) {
      throw new ApiError(404, "Studio not found");
    }

    await studio.update({
      ...data,
      updated_by: updaterId,
    });

    return studio;
  }

  //--------------------------------
  // UPDATE Studio
  //--------------------------------
  static async updateStudio(
    id: string,
    data: Partial<StudioAttributes>,
    updaterId: string,
  ): Promise<Studio> {
    const studio = await Studio.findByPk(id);

    if (!studio) {
      throw new ApiError(404, "Studio not found");
    }

    await studio.update({
      ...data,
      updated_by: updaterId,
    });

    return studio;
  }

  //--------------------------------
  // DELETE Studio
  //--------------------------------
  static async deleteStudio(id: string): Promise<void> {
    const studio = await Studio.findByPk(id);

    if (!studio) {
      throw new ApiError(404, "Studio not found");
    }

    await studio.destroy();
  }
}

export default StudioService;
