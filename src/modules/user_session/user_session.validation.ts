import { z } from "zod";

export const createUserSessionSchema = z.object({
  user_id: z.string().uuid(),
  refresh_token: z.string().min(20), // ensure it's a valid JWT or hashed string
  device_info: z.string().max(255).optional(),
  expires_at: z.date(),
});

export type CreateUserSessionInput = z.infer<typeof createUserSessionSchema>;

export const updateUserSessionSchema = z.object({
  refresh_token: z.string().min(20).optional(),
  device_info: z.string().max(255).optional(),
  expires_at: z.date().optional(),
  revoked_at: z.date().optional(),
});

export type UpdateUserSessionInput = z.infer<typeof updateUserSessionSchema>;
