import { Response } from "express";
import { AuthRequest } from "../../../middleware/authenticate.middleware";
import ChannelService from "./channel.service";
import { createChannelSchema, updateChannelSchema } from "./channel.validation";

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
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  //--------------------------------
  // GET All Channels
  //--------------------------------
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const channels = await ChannelService.getAllChannels();

      res.status(200).json({
        success: true,
        data: channels,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
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

      res.status(200).json({
        success: true,
        data: channel,
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
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

      res.status(200).json({
        success: true,
        data: channel,
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
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
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
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
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
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
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}
