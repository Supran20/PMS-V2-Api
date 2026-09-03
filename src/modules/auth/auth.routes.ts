import { Router } from "express";
import { AuthController } from "./auth.controller";
import validate from "../../middleware/validate.middleware";
import {
  loginSchema,
  verifyOtpSchema,
  refreshTokenSchema,
} from "./auth.validation";
import { authenticate } from "../../middleware/authenticate.middleware";

const router = Router();

router.post("/login", validate(loginSchema), AuthController.login);

router.post("/verify-otp", validate(verifyOtpSchema), AuthController.verifyOtp);

router.get("/resend-otp", AuthController.resendOtp);

router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  AuthController.refreshToken,
);

router.get("/me", authenticate, AuthController.me);

export default router;
