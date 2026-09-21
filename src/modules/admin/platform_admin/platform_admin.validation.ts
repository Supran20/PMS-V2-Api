import { z } from "zod";

const booleanFromString = z.preprocess((val) => {
  if (val === "true") return true;
  if (val === "false") return false;
  return val;
}, z.boolean());

export const createPlatformAdminSchema = z.object({
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
});

export type CreatePlatformAdminInput = z.infer<
  typeof createPlatformAdminSchema
>;

export const platformAdminIdParamSchema = z.object({
  id: z.string().uuid("Invalid platform admin id"),
});
