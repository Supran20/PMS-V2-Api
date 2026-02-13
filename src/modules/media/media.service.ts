import Media, { MediaCreationAttributes } from "./media.model";
import { IMedia } from "./media.interface";
import ApiError from "../../middleware/error-handlers/ApiError";
import Tags from "../tags/tags.model";

class MediaService {
  //-----------------------------
  // CREATE Media
  //-----------------------------
  static async createMedia(
    data: MediaCreationAttributes,
    userId: string
  ): Promise<Media> {
    const media = await Media.create({
      ...data,
      created_by: userId,
    });

    return media;
  }

  //-----------------------------
  // GET all Media
  //-----------------------------
  static async getAllMedia(): Promise<Media[]> {
    return await Media.findAll({
      include: [{ model: Tags, as: "tag", attributes: ["id", "tag_name"] }],
      order: [["created_at", "DESC"]],
    });
  }

  //-----------------------------
  // GET Media by ID
  //-----------------------------
  static async getMediaById(id: string): Promise<Media> {
    const media = await Media.findByPk(id);

    if (!media) {
      throw new ApiError(404, "Media not found");
    }

    return media;
  }

  //-----------------------------
  // UPDATE Media
  //-----------------------------
  static async updateMedia(
    id: string,
    data: Partial<IMedia>,
    userId: string
  ): Promise<Media> {
    const media = await Media.findByPk(id);

    if (!media) {
      throw new ApiError(404, "Media not found");
    }

    await media.update({
      ...data,
      updated_by: userId,
    });

    return media;
  }

  //-----------------------------
  // DELETE Media
  //-----------------------------
  static async deleteMedia(id: string): Promise<void> {
    const media = await Media.findByPk(id);

    if (!media) {
      throw new ApiError(404, "Media not found");
    }

    await media.destroy();
  }
}

export default MediaService;
