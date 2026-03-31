import Tags from "./tags.model";
import { ITag } from "./tags.interface";
import { generateUniqueSlug } from "../../utils/slugify";

type CreateTagDTO = {
  tag_name: string;
  slug?: string; // ✅ optional
};

type UpdateTagDTO = {
  tag_name?: string;
  slug?: string;
};

class TagService {
  async createTag(data: CreateTagDTO, userId: string) {
    // generate slug if not provided
    const slug = data.slug
      ? await generateUniqueSlug(data.slug, Tags)
      : await generateUniqueSlug(data.tag_name, Tags);

    return await Tags.create({
      tag_name: data.tag_name,
      slug,
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

  async getTagBySlug(slug: string) {
    return await Tags.findOne({
      where: { slug },
    });
  }

  async updateTag(id: string, data: UpdateTagDTO, userId: string) {
    const tag = await Tags.findByPk(id);
    if (!tag) return null;

    let slug = tag.slug;

    // regenerate slug if changed
    if (data.slug) {
      slug = await generateUniqueSlug(data.slug, Tags);
    } else if (data.tag_name) {
      slug = await generateUniqueSlug(data.tag_name, Tags);
    }

    await tag.update({
      ...data,
      slug,
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