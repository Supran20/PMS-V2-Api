import Tags from "./tags.model";
import { ITag } from "./tags.interface";

type CreateTagDTO = {
  tag_name: string;
  slug: string;
};

type UpdateTagDTO = {
  tag_name?: string;
  slug?: string;
};

class TagService {
  async createTag(data: CreateTagDTO, userId: string) {
    return await Tags.create({
      ...data,
      created_by: userId,
    });
  }

  async getAllTags() {
    return await Tags.findAll({
      order: [["created_at", "DESC"]],
    });
  }

  async getTagById(id: string) {
    return await Tags.findByPk(id);
  }

  async getTagBySlug(slug:string){
    return await Tags.findOne({
      where:{slug},
    })
  }

  async updateTag(id: string, data: UpdateTagDTO, userId: string) {
    const tag = await Tags.findByPk(id);
    if (!tag) return null;

    await tag.update({
      ...data,
      updated_by: userId,
      updated_at: new Date(),
    });

    return tag;
  }

  async deleteTag(id: string) {
    const tag = await Tags.findByPk(id);
    if (!tag) return null;

    await tag.destroy();
    return true;
  }

  async isSlugTaken(slug: string) {
    const tag = await Tags.findOne({ where: { slug } });
    return !!tag;
  }
}

export default new TagService();
