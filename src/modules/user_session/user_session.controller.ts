import { Response } from "express";
import { AuthRequest } from "../../middleware/authenticate.middleware";
import UserSessionService from "./user_session.service";

export class UserSessionController {
  //--------------------------------
  // CREATE SESSION (called from AuthService after login/OTP)
  //--------------------------------
  static async create(req: AuthRequest, res: Response) {
    try {
      const { user_id, refresh_token, device_info, expires_at } = req.body;

      const session = await UserSessionService.createSession({
        user_id,
        refresh_token,
        device_info,
        expires_at,
      });

      res.status(201).json({ success: true, data: session });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  //--------------------------------
  // GET USER SESSIONS
  //--------------------------------
  static async getUserSessions(req: AuthRequest, res: Response) {
    try {
      const user_id = req.user!.id;
      const sessions = await UserSessionService.getUserSessions(user_id);

      res.status(200).json({ success: true, data: sessions });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  //--------------------------------
  // REVOKE SESSION
  //--------------------------------
  static async revokeSession(req: AuthRequest, res: Response) {
    try {
      const session_id = req.params.id;
      if (!session_id || Array.isArray(session_id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid session ID" });
      }
      await UserSessionService.revokeSession(session_id);

      res.status(200).json({ success: true, message: "Session revoked" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  //--------------------------------
  // REVOKE ALL SESSIONS
  //--------------------------------
  static async revokeAllSessions(req: AuthRequest, res: Response) {
    try {
      const user_id = req.user!.id;
      await UserSessionService.revokeAllSessions(user_id);

      res.status(200).json({ success: true, message: "All sessions revoked" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
