import { Response, NextFunction } from "express";
import { AuthRequest } from "./authenticate.middleware";

export const authorize = (requiredPermissions: string | string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Super Admin bypasses ALL permission checks — this is intentional and
    // not driven by seeded permission data (Super Admin has none seeded).
    const isSuperAdmin = user.roles?.some(
      (role: any) => role.role_name === "Super Admin",
    );

    if (isSuperAdmin) {
      return next();
    }

    const userPermissions = new Set(
      user.permissions?.map((p: any) => p.permission_type) ?? [],
    );

    const required = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    const hasPermission = required.every((perm) => userPermissions.has(perm));

    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};
