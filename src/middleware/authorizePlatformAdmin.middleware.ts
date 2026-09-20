import { Response, NextFunction } from "express";
import { AuthRequest } from "./authenticate.middleware";
import PlatformAdmin from "../modules/admin/platform_admin/platform_admin.model";

export const authorizePlatformAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const platformAdmin = await PlatformAdmin.findOne({
      where: { user_id: req.user.id },
    });

    if (!platformAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access restricted to platform admins",
      });
    }

    return next();
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
