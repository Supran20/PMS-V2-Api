import { Response } from "express";
import { AuthRequest } from "../../middleware/authenticate.middleware";
import RoleService from "./role.service";

export class RoleController {
  //--------------------------------
  // GET Role's Default Permissions
  //--------------------------------
  static async getPermissions(req: AuthRequest, res: Response) {
    try {
      const permissions = await RoleService.getRolePermissions(
        String(req.params.id),
      );

      res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}
