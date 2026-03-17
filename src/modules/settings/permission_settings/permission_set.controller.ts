import { Response } from "express";
import { AuthRequest } from "../../../middleware/authenticate.middleware";
import PermissionSettingsService from "./permission_set.service";
import {
  createPermissionSettingsSchema,
  updatePermissionSettingsSchema,
} from "./permission_set.validation";

export class PermissionSettingsController {
  //--------------------------------
  // CREATE
  //--------------------------------
  static async create(req: AuthRequest, res: Response) {
    try {
      const validated = createPermissionSettingsSchema.parse(req.body);

      const permission = await PermissionSettingsService.create(
        validated,
        req.user?.id,
      );

      res.status(201).json({
        success: true,
        message: "Permission settings created successfully",
        data: permission,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  //--------------------------------
  // GET ALL
  //--------------------------------
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const permissions = await PermissionSettingsService.getAll();

      res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  //--------------------------------
  // GET BY ID
  //--------------------------------
  static async getById(req: AuthRequest, res: Response) {
    try {
      const permission = await PermissionSettingsService.getById(
        String(req.params.id),
      );

      res.status(200).json({
        success: true,
        data: permission,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  //--------------------------------
  // UPDATE
  //--------------------------------
  static async update(req: AuthRequest, res: Response) {
    try {
      const validated = updatePermissionSettingsSchema.parse(req.body);

      const permission = await PermissionSettingsService.update(
        String(req.params.id),
        validated,
        req.user?.id,
      );

      res.status(200).json({
        success: true,
        message: "Permission settings updated successfully",
        data: permission,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  //--------------------------------
  // DELETE
  //--------------------------------
  static async delete(req: AuthRequest, res: Response) {
    try {
      await PermissionSettingsService.delete(String(req.params.id));

      res.status(200).json({
        success: true,
        message: "Permission settings deleted successfully",
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }
}
