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
      res.status(400).json({ success: false, message: error.message });
    }
  }

  //--------------------------------
  // GET ALL
  //--------------------------------
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const interviews = await InterviewService.getAll();
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
      const interview = await InterviewService.getById(String(req.params.id));
      res.status(200).json({ success: true, data: interview });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  //--------------------------------
  // UPDATE
  //--------------------------------
  static async update(req: AuthRequest, res: Response) {
    try {
      const validated = updateInterviewSchema.parse(req.body);

      const interview = await InterviewService.updateInterview(
        String(req.params.id),
        validated,
        req.user.id,
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
      await InterviewService.deleteInterview(String(req.params.id));

      res.status(200).json({
        success: true,
        message: "Interview deleted successfully",
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}
