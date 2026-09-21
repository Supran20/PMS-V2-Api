import { Response } from "express";
import { AuthRequest } from "../../../middleware/authenticate.middleware";
import PlatformAdminService from "./platform_admin.service";
import {
  createPlatformAdminSchema,
  platformAdminIdParamSchema,
} from "./platform_admin.validation";

export class PlatformAdminController {
  //--------------------------------
  // CREATE Platform Admin
  //--------------------------------
  static async create(req: AuthRequest, res: Response) {
    try {
      const validated = createPlatformAdminSchema.parse(req.body);

      const platformAdmin = await PlatformAdminService.createPlatformAdmin(
        validated,
        req.user.id,
      );

      res.status(201).json({
        success: true,
        message: "Platform admin created successfully",
        data: platformAdmin,
      });
    } catch (error: any) {
      res.status(error.statusCode ?? 400).json({
        success: false,
        message: error.message,
      });
    }
  }

  //--------------------------------
  // GET All Platform Admins
  //--------------------------------
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const platformAdmins = await PlatformAdminService.getAllPlatformAdmins();

      res.status(200).json({
        success: true,
        data: platformAdmins,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  //--------------------------------
  // GET Platform Admin by ID
  //--------------------------------
  static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = platformAdminIdParamSchema.parse(req.params);

      const platformAdmin = await PlatformAdminService.getPlatformAdminById(id);

      res.status(200).json({
        success: true,
        data: platformAdmin,
      });
    } catch (error: any) {
      res.status(error.statusCode ?? 404).json({
        success: false,
        message: error.message,
      });
    }
  }

  //--------------------------------
  // DELETE (revoke) Platform Admin
  //--------------------------------
  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = platformAdminIdParamSchema.parse(req.params);

      await PlatformAdminService.deletePlatformAdmin(id, req.user.id);

      res.status(200).json({
        success: true,
        message: "Platform admin access revoked successfully",
      });
    } catch (error: any) {
      res.status(error.statusCode ?? 400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
