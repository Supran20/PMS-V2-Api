import { Response } from "express";
import { AuthRequest } from "../../middleware/authenticate.middleware";
import GuestReapprovalRequestService from "./guest_reapproval_request.service";
import {
  createGuestReapprovalRequestSchema,
  reviewGuestReapprovalRequestSchema,
} from "./guest_reapproval_request.validation";

export class GuestReapprovalRequestController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const validated = createGuestReapprovalRequestSchema.parse(req.body);

      const request = await GuestReapprovalRequestService.createRequest(
        validated,
        req.user,
      );

      res.status(201).json({
        success: true,
        message: "Guest reapproval request submitted successfully",
        data: request,
      });
    } catch (error: any) {
      res.status(error.statusCode ?? 400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getAll(req: AuthRequest, res: Response) {
    try {
      const status = req.query.status as
        | "pending"
        | "approved"
        | "rejected"
        | undefined;

      const requests = await GuestReapprovalRequestService.listRequests(
        req.user,
        status,
      );

      res.status(200).json({ success: true, data: requests });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const request = await GuestReapprovalRequestService.getRequestById(
        String(req.params.id),
        req.user,
      );

      res.status(200).json({ success: true, data: request });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async approve(req: AuthRequest, res: Response) {
    try {
      const validated = reviewGuestReapprovalRequestSchema.parse(req.body);

      const request = await GuestReapprovalRequestService.approveRequest(
        String(req.params.id),
        req.user,
        validated.review_note,
      );

      res.status(200).json({
        success: true,
        message: "Guest reapproval request approved successfully",
        data: request,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async reject(req: AuthRequest, res: Response) {
    try {
      const validated = reviewGuestReapprovalRequestSchema.parse(req.body);

      const request = await GuestReapprovalRequestService.rejectRequest(
        String(req.params.id),
        req.user,
        validated.review_note,
      );

      res.status(200).json({
        success: true,
        message: "Guest reapproval request rejected successfully",
        data: request,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
