import { Response } from "express";
import { AuthRequest } from "../../middleware/authenticate.middleware";
import LogService from "./log.service";

export class LogController {
  //--------------------------------
  // GET ALL LOGS
  //--------------------------------
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const logs = await LogService.getAllLogs();

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  //--------------------------------
  // GET LOG BY ID
  //--------------------------------
  static async getById(req: AuthRequest, res: Response) {
    try {
      const log = await LogService.getLogById(String(req.params.id));

      res.status(200).json({
        success: true,
        data: log,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }
}
