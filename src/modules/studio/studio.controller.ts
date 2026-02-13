import { Response } from "express";
import { AuthRequest } from "../../middleware/authenticate.middleware";
import StudioService from "./studio.service";
import { createStudioSchema, updateStudioSchema } from "./studio.validation";

export class StudioController {
  //--------------------------------
  // CREATE Studio
  //--------------------------------
  static async create(req: AuthRequest, res: Response) {
    try {
      const validated = createStudioSchema.parse(req.body);

      const studio = await StudioService.createStudio(validated, req.user.id);

      res.status(201).json({
        success: true,
        message: "Studio created successfully",
        data: studio,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  //--------------------------------
  // GET All Studios
  //--------------------------------
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const studios = await StudioService.getAllStudios();

      res.status(200).json({
        success: true,
        data: studios,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  //--------------------------------
  // GET Studio by ID
  //--------------------------------
  static async getById(req: AuthRequest, res: Response) {
    try {
      const studio = await StudioService.getStudioById(String(req.params.id));

      res.status(200).json({
        success: true,
        data: studio,
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  //--------------------------------
  // GET Studio by Slug
  //--------------------------------
  static async getBySlug(req: AuthRequest, res: Response) {
    try {
      const studio = await StudioService.getStudioBySlug(
        String(req.params.slug),
      );

      res.status(200).json({
        success: true,
        data: studio,
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  //--------------------------------
  // UPDATE Studio by Slug
  //--------------------------------
  static async updateBySlug(req: AuthRequest, res: Response) {
    try {
      const validated = updateStudioSchema.parse(req.body);

      const studio = await StudioService.updateStudioBySlug(
        String(req.params.slug),
        validated,
        req.user.id,
      );

      res.status(200).json({
        success: true,
        message: "Studio updated successfully",
        data: studio,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  //--------------------------------
  // UPDATE Studio
  //--------------------------------
  static async update(req: AuthRequest, res: Response) {
    try {
      const validated = updateStudioSchema.parse(req.body);

      const studio = await StudioService.updateStudio(
        String(req.params.id),
        validated,
        req.user.id,
      );

      res.status(200).json({
        success: true,
        message: "Studio updated successfully",
        data: studio,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  //--------------------------------
  // DELETE Studio
  //--------------------------------
  static async delete(req: AuthRequest, res: Response) {
    try {
      await StudioService.deleteStudio(String(req.params.id));

      res.status(200).json({
        success: true,
        message: "Studio deleted successfully",
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}
