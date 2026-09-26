// src/middleware/resolveTenant.middleware.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "./authenticate.middleware";
import Channel from "../modules/admin/channel/channel.model";
import { tenantContext } from "../context/tenant-context";

const BLOCKED_STATUSES = ["suspended", "cancelled"];

export const resolveTenant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const channelId = req.user?.channel_id;

    if (!channelId) {
      return res.status(403).json({
        success: false,
        message: "No channel associated with this user",
      });
    }

    // Channel itself isn't a tenanted model (it has no channel_id column),
    // so no bypassTenantScope needed here.
    const channel = await Channel.findByPk(channelId);

    if (!channel) {
      return res
        .status(403)
        .json({ success: false, message: "Channel not found" });
    }

    if (BLOCKED_STATUSES.includes(channel.status)) {
      return res.status(423).json({
        success: false,
        message: `This channel is ${channel.status}`,
      });
    }

    req.channel = channel;

    // Everything downstream of next() — the rest of this request, including
    // every awaited Sequelize call in it — runs inside this channel's context.
    return tenantContext.run(channelId, () => next());
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
