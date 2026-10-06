import { z } from "zod";

const booleanFromString = z.preprocess((val) => {
  if (val === "true") return true;
  if (val === "false") return false;
  return val;
}, z.boolean());

const refineOtpRules = (
  data: {
    enable_otp_login?: boolean;
    otp_in_mail?: boolean;
    otp_in_sms?: boolean;
    mobile_number?: string;
  },
  ctx: z.RefinementCtx,
) => {
  if (!data.enable_otp_login) return;

  if (!!data.otp_in_mail === !!data.otp_in_sms) {
    ctx.addIssue({
      code: "custom",
      path: ["otp_in_mail"],
      message: "Select exactly one OTP method (Email or SMS)",
    });
  }

  if (data.otp_in_sms && !data.mobile_number) {
    ctx.addIssue({
      code: "custom",
      path: ["mobile_number"],
      message: "Mobile number is required for SMS OTP",
    });
  }
};

export const createPlatformAdminSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters"),
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),

    status: z.enum(["active", "inactive"]).optional(),

    mobile_number: z
      .string()
      .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number")
      .optional(),

    enable_otp_login: booleanFromString.optional(),
    otp_in_mail: booleanFromString.optional(),
    otp_in_sms: booleanFromString.optional(),
  })
  .superRefine(refineOtpRules);

export type CreatePlatformAdminInput = z.infer<
  typeof createPlatformAdminSchema
>;

export const platformAdminIdParamSchema = z.object({
  id: z.string().uuid("Invalid platform admin id"),
});

export const updatePlatformAdminSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .optional(),
  mobile_number: z
    .union([
      z.literal(""),
      z.string().regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number"),
    ])
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  status: z.enum(["active", "inactive"]).optional(),
  enable_otp_login: booleanFromString.optional(),
  otp_in_mail: booleanFromString.optional(),
  otp_in_sms: booleanFromString.optional(),
});

export type UpdatePlatformAdminInput = z.infer<
  typeof updatePlatformAdminSchema
>;
