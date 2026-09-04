import { Response } from "express";
import { AuthRequest } from "../../middleware/authenticate.middleware";
import PermissionService from "./permission.service";

export class PermissionController {
  //--------------------------------
  // GET All Permissions
  //--------------------------------
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const permissions = await PermissionService.getAllPermissions();

      res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
