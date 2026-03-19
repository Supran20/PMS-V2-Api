import Log from "./log.model";
import { LogCreationAttributes } from "./log.interface";
import ApiError from "../../middleware/error-handlers/ApiError";

class LogService {
  //--------------------------------
  // CREATE LOG (used internally)
  //--------------------------------
  static async createLog(data: LogCreationAttributes): Promise<Log> {
    const log = await Log.create({
      ...data,
      status: data.status ?? "pending",
    });

    return log;
  }

  //--------------------------------
  // MARK AS SENT
  //--------------------------------
  static async markAsSent(id: string): Promise<Log> {
    const log = await Log.findByPk(id);

    if (!log) {
      throw new ApiError(404, "Log not found");
    }

    await log.update({
      status: "sent",
      sent_at: new Date(),
      error_message: null,
    });

    return log;
  }

  //--------------------------------
  // MARK AS FAILED
  //--------------------------------
  static async markAsFailed(id: string, error: any): Promise<Log> {
    const log = await Log.findByPk(id);

    if (!log) {
      throw new ApiError(404, "Log not found");
    }

    await log.update({
      status: "failed",
      error_message: error,
    });

    return log;
  }

  //--------------------------------
  // GET ALL LOGS (for admin/debug)
  //--------------------------------
  static async getAllLogs(): Promise<Log[]> {
    return await Log.findAll({
      order: [["created_at", "DESC"]],
    });
  }

  //--------------------------------
  // GET LOG BY ID
  //--------------------------------
  static async getLogById(id: string): Promise<Log> {
    const log = await Log.findByPk(id);

    if (!log) {
      throw new ApiError(404, "Log not found");
    }

    return log;
  }
}

export default LogService;
