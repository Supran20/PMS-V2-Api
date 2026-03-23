import { Response } from "express";
import { AuthRequest } from "../../middleware/authenticate.middleware";
import SettingsService from "./settings.service";
import {
  createSettingsSchema,
  updateSettingsSchema,
} from "./settings.validation";

export class SettingsController {
  //--------------------------------
  // CREATE
  //--------------------------------
  static async create(req: AuthRequest, res: Response) {
    try {
      const validated = createSettingsSchema.parse(req.body);

      const settings = await SettingsService.createSettings(
        validated,
        req.user?.id,
      );

      res.status(201).json({
        success: true,
        message: "Settings created successfully",
        data: settings,
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
      const settings = await SettingsService.getAllSettings();

      res.status(200).json({
        success: true,
        data: settings,
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
      const settings = await SettingsService.getSettingsById(
        String(req.params.id),
      );

      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  //--------------------------------
  // GET BY TYPE
  //--------------------------------
  static async getByType(
    req: AuthRequest & { params: { type: string } },
    res: Response,
  ) {
    try {
      const { type } = req.params;

      const settings = await SettingsService.getSettingsByType(type);

      res.status(200).json({
        success: true,
        data: settings,
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
      const validated = updateSettingsSchema.parse(req.body);

      const settings = await SettingsService.updateSettings(
        String(req.params.id),
        validated,
        req.user?.id,
      );

      res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        data: settings,
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
      await SettingsService.deleteSettings(String(req.params.id));

      res.status(200).json({
        success: true,
        message: "Settings deleted successfully",
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }
}
