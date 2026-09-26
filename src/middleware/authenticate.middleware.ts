import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../modules/users/user.model";
import Role from "../modules/roles/role.model";
import Permission from "../modules/permissions/permission.model";

export interface AuthRequest extends Request {
  user?: any;
  channel?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as {
      id: string;
    };

    // bypassTenantScope: true — this runs BEFORE resolveTenant, so there is
    // no channel context yet. We're looking the user up BY id, which is
    // already a hard scope on its own; resolveTenant (right after this
    // middleware, on tenant routes) is what enforces channel_id from here on.
    const user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          as: "roles",
          through: { attributes: [] },
        },
        {
          model: Permission,
          as: "permissions",
          through: { attributes: [] },
        },
      ],
      bypassTenantScope: true,
    } as any);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error: any) {
    console.log("AUTH ERROR:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
