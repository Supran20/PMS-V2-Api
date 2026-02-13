import { z } from "zod";

export const createUserSchema = z.object({
  full_name: z.string().min(3),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  role_name: z.enum(["Admin", "Host", "Staff"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
