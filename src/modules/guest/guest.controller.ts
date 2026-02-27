import { Response } from "express";
import { AuthRequest } from "../../middleware/authenticate.middleware";
import GuestService from "./guest.service";
import { createGuestSchema, updateGuestSchema } from "./guest.validation";

export class GuestController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const validated = createGuestSchema.parse(req.body);

      const guest = await GuestService.createGuest(
        validated,
        req.user,
        req.file,
      );

      res.status(201).json({
        success: true,
        message: "Guest created successfully",
        data: guest,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getAll(req: AuthRequest, res: Response) {
    try {
      const guests = await GuestService.getAllGuests();

      res.status(200).json({
        success: true,
        data: guests,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const guest = await GuestService.getGuestById(String(req.params.id));

      res.status(200).json({
        success: true,
        data: guest,
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async approve(req: AuthRequest, res: Response) {
    try {
      const guest = await GuestService.approveGuest(
        String(req.params.id),
        req.user,
      );

      res.status(200).json({
        success: true,
        message: "Guest approved successfully",
        data: guest,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getBySlug(req: AuthRequest, res: Response) {
    try {
      const guest = await GuestService.getGuestBySlug(String(req.params.slug));

      res.status(200).json({
        success: true,
        data: guest,
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async updateBySlug(req: AuthRequest, res: Response) {
    try {
      const validated = updateGuestSchema.parse(req.body);

      const guest = await GuestService.updateGuestBySlug(
        String(req.params.slug),
        validated,
        req.user.id,
      );

      res.status(200).json({
        success: true,
        message: "Guest updated successfully",
        data: guest,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      await GuestService.deleteGuest(String(req.params.id));

      res.status(200).json({
        success: true,
        message: "Guest deleted successfully",
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}
