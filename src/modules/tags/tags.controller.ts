// src/modules/tags/tags.controller.ts

import { Request, Response } from "express";
import tagService from "./tags.service";
import { createTagSchema, updateTagSchema } from "./tags.validation";

interface AuthenticatedRequest extends Request {
  user?: any;
}

class TagController {
  // CREATE
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = createTagSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.flatten(),
        });
      }

      const { slug } = parsed.data;

      // Prevent duplicate slug
      const exists = await tagService.isSlugTaken(slug);
      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Slug already exists",
        });
      }

      const userId = req.user?.id ?? null; // from auth middleware
      const tag = await tagService.createTag(parsed.data, userId);

      return res.status(201).json({
        success: true,
        message: "Tag created successfully",
        data: tag,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  }

  // GET ALL
  async getAll(req: Request, res: Response) {
    try {
      const tags = await tagService.getAllTags();
      return res.json({ success: true, data: tags });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  }

  // GET BY ID
  async getById(req: Request, res: Response) {
    try {
      const idParam = req.params.id;

      if (typeof idParam !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid id parameter",
        });
      }

      const tag = await tagService.getTagById(idParam);

      if (!tag)
        return res
          .status(404)
          .json({ success: false, message: "Tag not found" });

      return res.json({ success: true, data: tag });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  }

  // GET /tags/slug/:slug
  async getTagBySlug(req: Request, res: Response) {
    const { slug } = req.params;

    const slugParam = req.params.slug;

    if (typeof slugParam !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid slug parameter",
      });
    }

    const tag = await tagService.getTagBySlug(slugParam);

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    return res.json({ data: tag });
  }

  // UPDATE
  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = updateTagSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.flatten(),
        });
      }

      const userId = req.user?.id ?? null;

      const idParam = req.params.id;

      if (typeof idParam !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid id parameter",
        });
      }

      const updated = await tagService.updateTag(idParam, parsed.data, userId);

      if (!updated)
        return res
          .status(404)
          .json({ success: false, message: "Tag not found" });

      return res.json({
        success: true,
        message: "Tag updated successfully",
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  }

  // DELETE
  async delete(req: Request, res: Response) {
    try {
      const idParam = req.params.id;

      if (typeof idParam !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid id parameter",
        });
      }

      const deleted = await tagService.deleteTag(idParam);
      if (!deleted)
        return res
          .status(404)
          .json({ success: false, message: "Tag not found" });

      return res.json({
        success: true,
        message: "Tag deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  }
}

export default new TagController();
