import { z } from "zod";

export const createUserSchema = z.object({
  full_name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  status: z.enum(["active", "inactive"]).optional(),
  profile_image: z.string().uuid().optional(),
  mobile_number: z.string().optional(),
  enable_otp_login: z.boolean().optional(),
  otp_in_mail: z.boolean().optional(),
  otp_in_sms: z.boolean().optional(),
  role_name: z.enum(["Admin", "Host", "Staff"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  full_name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  profile_image: z.string().uuid().nullable().optional(),
  mobile_number: z.string().optional(),
  enable_otp_login: z.boolean().optional(),
  otp_in_mail: z.boolean().optional(),
  otp_in_sms: z.boolean().optional(),
  role_name: z.enum(["Admin", "Host", "Staff"]).optional(),
});
