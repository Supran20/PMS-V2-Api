import { Response } from "express";
import { AuthRequest } from "../../middleware/authenticate.middleware";
import InterviewService from "./interview.service";

import {
  createInterviewSchema,
  updateInterviewSchema,
} from "./interview.validation";

export class InterviewController {
  //--------------------------------
  // CREATE
  //--------------------------------
  static async create(req: AuthRequest, res: Response) {
    try {
      const validated = createInterviewSchema.parse(req.body);

      const interview = await InterviewService.createInterview(
        validated,
        req.user.id,
      );

      res.status(201).json({
        success: true,
        message: "Interview scheduled successfully",
        data: interview,
      });
    } catch (error: any) {
      res.status(error.statusCode ?? 400).json({
        success: false,
        message: error.message,
        code: error.code,
        guestId: error.guestId,
        reapprovalRequestId: error.reapprovalRequestId,
      });
    }
  }

  //--------------------------------
  // GET ALL
  //--------------------------------
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const interviews = await InterviewService.getAll(req.user);
      res.status(200).json({ success: true, data: interviews });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  //--------------------------------
  // GET BY ID
  //--------------------------------
  static async getById(req: AuthRequest, res: Response) {
    try {
      const interview = await InterviewService.getById(
        String(req.params.id),
        req.user,
      );
      res.status(200).json({ success: true, data: interview });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  //--------------------------------
  // GET EPISODE META
  //--------------------------------
  static async getEpisodeMeta(req: AuthRequest, res: Response) {
    try {
      const meta = await InterviewService.getEpisodeMeta();

      res.status(200).json({
        success: true,
        data: meta,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  //--------------------------------
  // REORDER
  //--------------------------------
  static async reorder(req: AuthRequest, res: Response) {
    try {
      const { orderedIds } = req.body;

      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({
          success: false,
          message: "orderedIds must be an array",
        });
      }

      await InterviewService.reorderInterviews(orderedIds, req.user);

      res.status(200).json({
        success: true,
        message: "Interview order updated successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  //--------------------------------
  // ASSIGN EPISODE
  //--------------------------------
  static async assignEpisode(req: AuthRequest, res: Response) {
    try {
      const { interviewId, targetEpisode } = req.body;

      if (!interviewId || !targetEpisode) {
        return res.status(400).json({
          success: false,
          message: "interviewId and targetEpisode required",
        });
      }

      await InterviewService.assignEpisode(
        interviewId,
        targetEpisode,
        req.user,
      );

      res.status(200).json({
        success: true,
        message: "Episode reassigned successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  //--------------------------------
  // UPDATE
  //--------------------------------
  static async update(req: AuthRequest, res: Response) {
    try {
      const interview = await InterviewService.updateInterview(
        String(req.params.id),
        req.body,
        req.user,
      );

      res.status(200).json({
        success: true,
        message: "Interview updated successfully",
        data: interview,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  //--------------------------------
  // DELETE
  //--------------------------------
  static async delete(req: AuthRequest, res: Response) {
    try {
      await InterviewService.deleteInterview(String(req.params.id), req.user);

      res.status(200).json({
        success: true,
        message: "Interview deleted successfully",
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  //--------------------------------
  // RESHUFFLE
  //--------------------------------
  static async reshuffle(req: AuthRequest, res: Response) {
    try {
      await InterviewService.reshuffleEpisodes(req.user.id);

      res.status(200).json({
        success: true,
        message: "Episodes reshuffled successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
