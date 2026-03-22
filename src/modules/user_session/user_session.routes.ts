import { Router } from "express";
import { UserSessionController } from "./user_session.controller";
import { authenticate } from "../../middleware/authenticate.middleware";

const router = Router();

// Get all active sessions for current user
router.get("/", authenticate, UserSessionController.getUserSessions);

// Revoke a specific session by ID
router.delete("/:id", authenticate, UserSessionController.revokeSession);

// Revoke all sessions (logout all devices)
router.delete("/", authenticate, UserSessionController.revokeAllSessions);

// Optional: create session manually (used internally by AuthService after login/OTP)
router.post("/", authenticate, UserSessionController.create);

export default router;
