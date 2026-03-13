import { AuthController } from "./auth.controller";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../modules/users/user.model";
import Role from "../../modules/roles/role.model";
import Permission from "../../modules/permissions/permission.model";
import { sendEmail } from "../../services/email.service";
import { generateOtpEmailHtml } from "../../services/email.service";

const ACCESS_TOKEN_EXPIRY = "8h";
const REFRESH_TOKEN_EXPIRY = "8h";

export class AuthService {
  //Generate access and refresh tokens
  private static generateTokens(payload: object) {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY!, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    return { accessToken, refreshToken };
  }

  /* ================= LOGIN ================= */
  static async login(email: string, password: string) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // If OTP is enabled for the user
    if (user.enable_otp_login) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours

      user.otp = otp;
      user.otp_expires_at = otpExpiry;
      await user.save();

      // Send OTP via Email
      if (user.otp_in_mail) {
        const html = generateOtpEmailHtml(otp);

        await sendEmail(
          user.email,
          "Your OTP Code",
          `Your OTP code is: ${otp}`,
          await html,
        );
      }

      //Temporary token for OTP actions
      const tempToken = jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET_KEY!,
        { expiresIn: "15m" },
      );

      return {
        message: "OTP sent to your email. Please verify to complete login.",
        temp_token: tempToken,
      };
    }

    // Direct login without OTP
    const { accessToken, refreshToken } = this.generateTokens({
      id: user.id,
      email: user.email,
    });

    return { accessToken, refreshToken };
  }

  /* ================= OTP ================= */
  // Verify OTP and issue JWT token
  static async verifyOtp(otp: string, token: string) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as {
      email: string;
    };
    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) throw new Error("User not found");
    if (!user.otp || user.otp !== otp) throw new Error("Invalid OTP");

    if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
      user.otp = null;
      user.otp_expires_at = null;
      await user.save();
      throw new Error("OTP expired. Please request a new one.");
    }

    user.otp = null;
    user.otp_expires_at = null;
    await user.save();

    const { accessToken, refreshToken } = this.generateTokens({
      id: user.id,
      email: user.email,
    });

    return { accessToken, refreshToken };
  }

  // Resend OTP
  static async resendOtp(tempToken: string) {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET_KEY!) as {
      email: string;
    };
    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) throw new Error("User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours

    user.otp = otp;
    user.otp_expires_at = otpExpiry;
    await user.save();

    if (user.otp_in_mail) {
      await sendEmail(
        user.email,
        "Your OTP Code",
        `Your OTP code is: ${otp}. It is valid for 3 hours.`,
      );
    }
    return { message: "New OTP sent to your email." };
  }

  /* ================= REFRESH ================= */
  //Refresh Access Token
  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!,
      ) as {
        id: string;
        email: string;
        username: string;
      };

      const user = await User.findOne({ where: { id: decoded.id } });
      if (!user) throw new Error("User not found");

      const newAccessToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET_KEY!,
        { expiresIn: ACCESS_TOKEN_EXPIRY },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  /* ================= ME (IMPORTANT) ================= */
  static async getMeWithPermissions(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "full_name",
        "email",
        "status",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["role_name"],
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              as: "permissions",
              attributes: ["permission_type"],
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) return null;

    const roles = user.roles?.map((r) => r.role_name) ?? [];

    const permissions = Array.from(
      new Set(
        user.roles?.flatMap(
          (r) => r.permissions?.map((p) => p.permission_type) ?? [],
        ),
      ),
    );

    return {
      ...user.toJSON(),
      roles,
      permissions,
    };
  }
}
