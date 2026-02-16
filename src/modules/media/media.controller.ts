import { Request, Response, NextFunction } from "express";
import MediaService from "./media.service";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class MediaController {
  // Create Media
  static async createMedia(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Media file is required",
        });
      }

      const mediaPath = `/uploads/media/${req.file.filename}`;
      const media_type = req.file.mimetype;

      const media = await MediaService.createMedia(
        { ...req.body, path: mediaPath, type: media_type },
        userId,
      );

      return res.status(201).json({
        success: true,
        message: "Media created successfully",
        data: media,
      });
    } catch (err) {
      next(err);
    }
  }

  // Get all Media
  static async getAllMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const mediaList = await MediaService.getAllMedia();

      return res.status(200).json({
        success: true,
        message: "Media fetched successfully",
        data: mediaList,
      });
    } catch (err) {
      next(err);
    }
  }

  // Get Media by ID
  static async getMediaById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const media = await MediaService.getMediaById(id);

      return res.status(200).json({
        success: true,
        message: "Media fetched successfully",
        data: media,
      });
    } catch (err) {
      next(err);
    }
  }

  // Update Media
  static async updateMedia(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = req.params.id;
      const userId = req.user?.id;

      // Normalize body values (fix string | string[])
      const media_name =
        typeof req.body.media_name === "string"
          ? req.body.media_name
          : undefined;

      let tag_id: string | null | undefined;

      if (typeof req.body.tag_id === "string") {
        tag_id = req.body.tag_id === "" ? null : req.body.tag_id;
      }

      let updatePayload: any = {
        ...(media_name !== undefined && { media_name }),
        ...(tag_id !== undefined && { tag_id }),
      };

      // File is OPTIONAL
      if (req.file) {
        const mediaPath = `/uploads/media/${req.file.filename}`;
        const media_type = req.file.mimetype; // store real mimetype

        updatePayload = {
          ...updatePayload,
          path: mediaPath,
          type: media_type,
        };
      }

      const updated = await MediaService.updateMedia(id, updatePayload, userId);

      return res.status(200).json({
        success: true,
        message: "Media updated successfully",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  // Delete Media
  static async deleteMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      await MediaService.deleteMedia(id);

      return res.status(200).json({
        success: true,
        message: "Media deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
}
