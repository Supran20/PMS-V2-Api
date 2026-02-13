import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { AuthRequest } from "../../middleware/authenticate.middleware";

export class AuthController {
  /**
   * Login endpoint
   * POST /auth/login
   * Body: { email: string, password: string }
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Verify OTP endpoint
   * POST /auth/verify-otp
   * Body: { email: string, otp: string }
   */

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { otp } = req.body;
      const tempToken = req.headers.authorization?.split(" ")[1];
      if (!tempToken) throw new Error("Authorization header missing");

      const result = await AuthService.verifyOtp(otp, tempToken);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Resend OTP endpoint
   * GET /auth/resend-otp
   */

  static async resendOtp(req: Request, res: Response) {
    try {
      const tempToken = req.headers.authorization?.split(" ")[1];
      if (!tempToken) throw new Error("Authorization header missing");

      const result = await AuthService.resendOtp(tempToken);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Refresh Token endpoint
   * POST /auth/refresh-token
   * Body: { refreshToken: string }
   */

  static async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.body.refreshToken;
      if (!refreshToken) throw new Error("Refresh token missing");

      const result = await AuthService.refreshToken(refreshToken);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // to get ME API
  // static async me(req: AuthRequest, res: Response) {
  //   try {
  //     const userId = req.user?.id;

  //     if (!userId) {
  //       return res.status(401).json({ message: "Unauthorized" });
  //     }

  //     const user = await getSafeUserById(userId);

  //     if (!user) {
  //       return res.status(404).json({ message: "User not found" });
  //     }

  //     return res.status(200).json({
  //       success: true,
  //       data: user,
  //     });
  //   } catch (error) {
  //     return res.status(500).json({ message: "Server error" });
  //   }
  // }

  /* ================= /auth/me ================= */

  static async me(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await AuthService.getMeWithPermissions(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.log("JWT ERROR:", error);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }
}
