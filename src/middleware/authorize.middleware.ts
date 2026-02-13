import { Response, NextFunction } from "express";
import { AuthRequest } from "./authenticate.middleware";

export const authorize = (requiredPermissions: string | string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userPermissions = Array.from(
      new Set(
        user.roles?.flatMap(
          (role: any) =>
            role.permissions?.map((p: any) => p.permission_type) ?? [],
        ),
      ),
    );

    const required = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    const hasPermission = required.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};
