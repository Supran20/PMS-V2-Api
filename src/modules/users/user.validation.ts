import { z } from "zod";

const booleanFromString = z.preprocess((val) => {
  if (val === "true") return true;
  if (val === "false") return false;
  return val;
}, z.boolean());

const permissionIdsFromFormData = z.preprocess((val) => {
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return val;
    }
  }

  return val;
}, z.array(z.string().uuid()).optional());

export const createUserSchema = z.object({
  full_name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),

  status: z.enum(["active", "inactive"]).optional(),

  mobile_number: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number")
    .optional(),

  enable_otp_login: booleanFromString.optional(),
  otp_in_mail: booleanFromString.optional(),
  otp_in_sms: booleanFromString.optional(),

  role_name: z.enum(["Admin", "Host", "Staff", "Super Admin"]),

  permission_ids: permissionIdsFromFormData,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  full_name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  mobile_number: z.string().optional(),

  enable_otp_login: booleanFromString.optional(),
  otp_in_mail: booleanFromString.optional(),
  otp_in_sms: booleanFromString.optional(),

  role_name: z.enum(["Admin", "Host", "Staff", "Super Admin"]).optional(),

  permission_ids: permissionIdsFromFormData,
});
