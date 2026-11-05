import { Response } from "express";
import { AuthRequest } from "../../middleware/authenticate.middleware";
import ApiError from "../../middleware/error-handlers/ApiError";
import { sendError } from "../../middleware/error-handlers/sendError";
import ChannelProfileService from "./channel_profile.service";
import { updateMyChannelSchema } from "./channel_profile.validation";

export class ChannelProfileController {
  //--------------------------------
  // GET my channel profile
  //--------------------------------
  static async get(req: AuthRequest, res: Response) {
    try {
      const data = await ChannelProfileService.getProfile(req.channel.id);

      res.status(200).json({ success: true, data });
    } catch (error) {
      sendError(res, error);
    }
  }

  //--------------------------------
  // UPDATE my channel profile
  //--------------------------------
  static async update(req: AuthRequest, res: Response) {
    try {
      const validated = updateMyChannelSchema.parse(req.body);

      const data = await ChannelProfileService.updateProfile(
        req.channel.id,
        validated,
        req.user.id,
      );

      res.status(200).json({
        success: true,
        message: "Channel profile updated successfully",
        data,
      });
    } catch (error) {
      sendError(res, error);
    }
  }

  //--------------------------------
  // UPLOAD / REPLACE logo
  //--------------------------------
  static async uploadLogo(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        throw new ApiError(400, "Logo file is required");
      }

      const data = await ChannelProfileService.setLogo(
        req.channel.id,
        req.file,
        req.user.id,
      );

      res.status(200).json({
        success: true,
        message: "Logo updated successfully",
        data,
      });
    } catch (error) {
      sendError(res, error);
    }
  }

  //--------------------------------
  // REMOVE logo
  //--------------------------------
  static async removeLogo(req: AuthRequest, res: Response) {
    try {
      const data = await ChannelProfileService.removeLogo(
        req.channel.id,
        req.user.id,
      );

      res.status(200).json({
        success: true,
        message: "Logo removed successfully",
        data,
      });
    } catch (error) {
      sendError(res, error);
    }
  }
}
