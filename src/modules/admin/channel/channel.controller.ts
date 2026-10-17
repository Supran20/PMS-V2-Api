import { Response } from "express";
import { ZodError } from "zod";
import { AuthRequest } from "../../../middleware/authenticate.middleware";
import ApiError from "../../../middleware/error-handlers/ApiError";
import ChannelService from "./channel.service";
import {
  assignPlanSchema,
  createChannelSchema,
  updateChannelSchema,
} from "./channel.validation";
import { sendError } from "../../../middleware/error-handlers/sendError";

export class ChannelController {
  //--------------------------------
  // CREATE Channel
  //--------------------------------
  static async create(req: AuthRequest, res: Response) {
    try {
      const validated = createChannelSchema.parse(req.body);

      const { channel, admin } = await ChannelService.createChannel(
        validated,
        req.user.id,
      );

      res.status(201).json({
        success: true,
        message: "Channel created successfully",
        data: { ...channel.toJSON(), admin },
      });
    } catch (error) {
      sendError(res, error);
    }
  }

  //--------------------------------
  // GET All Channels
  //--------------------------------
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const channels = await ChannelService.getAllChannels();

      res.status(200).json({ success: true, data: channels });
    } catch (error) {
      sendError(res, error);
    }
  }

  //--------------------------------
  // GET Channel by ID
  //--------------------------------
  static async getById(req: AuthRequest, res: Response) {
    try {
      const channel = await ChannelService.getChannelById(
        String(req.params.id),
      );

      res.status(200).json({ success: true, data: channel });
    } catch (error) {
      sendError(res, error);
    }
  }

  //--------------------------------
  // GET Channel by Slug
  //--------------------------------
  static async getBySlug(req: AuthRequest, res: Response) {
    try {
      const channel = await ChannelService.getChannelBySlug(
        String(req.params.slug),
      );

      res.status(200).json({ success: true, data: channel });
    } catch (error) {
      sendError(res, error);
    }
  }

  //--------------------------------
  // UPDATE Channel by Slug
  //--------------------------------
  static async updateBySlug(req: AuthRequest, res: Response) {
    try {
      const validated = updateChannelSchema.parse(req.body);

      const channel = await ChannelService.updateChannelBySlug(
        String(req.params.slug),
        validated,
        req.user.id,
      );

      res.status(200).json({
        success: true,
        message: "Channel updated successfully",
        data: channel,
      });
    } catch (error) {
      sendError(res, error);
    }
  }

  //--------------------------------
  // UPDATE Channel
  //--------------------------------
  static async update(req: AuthRequest, res: Response) {
    try {
      const validated = updateChannelSchema.parse(req.body);

      const channel = await ChannelService.updateChannel(
        String(req.params.id),
        validated,
        req.user.id,
      );

      res.status(200).json({
        success: true,
        message: "Channel updated successfully",
        data: channel,
      });
    } catch (error) {
      sendError(res, error);
    }
  }

  //--------------------------------
  // ASSIGN Plan
  //--------------------------------
  static async assignPlan(req: AuthRequest, res: Response) {
    try {
      const validated = assignPlanSchema.parse(req.body);

      const channel = await ChannelService.assignPlan(
        String(req.params.id),
        validated,
        req.user.id,
      );

      res.status(200).json({
        success: true,
        message: "Subscription plan updated successfully",
        data: channel,
      });
    } catch (error) {
      sendError(res, error);
    }
  }

  //--------------------------------
  // SUSPEND Channel
  //--------------------------------
  static async suspend(req: AuthRequest, res: Response) {
    try {
      const channel = await ChannelService.suspendChannel(
        String(req.params.id),
        req.user.id,
      );

      res.status(200).json({
        success: true,
        message: "Channel suspended successfully",
        data: channel,
      });
    } catch (error) {
      sendError(res, error);
    }
  }

  //--------------------------------
  // REACTIVATE Channel
  //--------------------------------
  static async reactivate(req: AuthRequest, res: Response) {
    try {
      const channel = await ChannelService.reactivateChannel(
        String(req.params.id),
        req.user.id,
      );

      res.status(200).json({
        success: true,
        message: "Channel reactivated successfully",
        data: channel,
      });
    } catch (error) {
      sendError(res, error);
    }
  }

  //--------------------------------
  // DELETE Channel
  //--------------------------------
  static async delete(req: AuthRequest, res: Response) {
    try {
      await ChannelService.deleteChannel(String(req.params.id));

      res.status(200).json({
        success: true,
        message: "Channel deleted successfully",
      });
    } catch (error) {
      sendError(res, error);
    }
  }
}
