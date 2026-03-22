import { sequelize } from "../../config/db";
import { Transaction } from "sequelize";
import UserSession from "./user_session.model";
import ApiError from "../../middleware/error-handlers/ApiError";

class UserSessionService {
  //--------------------------------
  // CREATE SESSION
  //--------------------------------
  static async createSession(data: {
    user_id: string;
    refresh_token: string;
    device_info?: string;
    expires_at: Date;
  }): Promise<UserSession> {
    const transaction: Transaction = await sequelize.transaction();
    try {
      const session = await UserSession.create(data, { transaction });
      await transaction.commit();
      return session;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //--------------------------------
  // GET ACTIVE SESSIONS FOR USER
  //--------------------------------
  static async getUserSessions(user_id: string): Promise<UserSession[]> {
    return await UserSession.findAll({
      where: { user_id, revoked_at: null },
      order: [["created_at", "DESC"]],
    });
  }

  //--------------------------------
  // REVOKE SESSION
  //--------------------------------
  static async revokeSession(session_id: string): Promise<void> {
    const session = await UserSession.findByPk(session_id);
    if (!session) throw new ApiError(404, "Session not found");

    await session.update({ revoked_at: new Date() });
  }

  //--------------------------------
  // REVOKE ALL SESSIONS FOR USER (LOGOUT ALL DEVICES)
  //--------------------------------
  static async revokeAllSessions(user_id: string): Promise<void> {
    await UserSession.update(
      { revoked_at: new Date() },
      { where: { user_id, revoked_at: null } },
    );
  }
}

export default UserSessionService;
