import { Router } from "express";
import { AuthController } from "./auth.controller";
import validate from "../../middleware/validate.middleware";
import {
  loginSchema,
  verifyOtpSchema,
  refreshTokenSchema,
} from "./auth.validation";
import { authenticate } from "../../middleware/authenticate.middleware";
import {
  loginLimiter,
  verifyOtpLimiter,
  resendOtpLimiter,
  refreshLimiter,
} from "../../middleware/rateLimit.middleware";

const router = Router();

router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  AuthController.login,
);

router.post(
  "/verify-otp",
  verifyOtpLimiter,
  validate(verifyOtpSchema),
  AuthController.verifyOtp,
);

router.get("/resend-otp", resendOtpLimiter, AuthController.resendOtp);

router.post(
  "/refresh-token",
  refreshLimiter,
  validate(refreshTokenSchema),
  AuthController.refreshToken,
);

router.get("/me", authenticate, AuthController.me);

export default router;
