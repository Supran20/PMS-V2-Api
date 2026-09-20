import { z } from "zod";

export const createSubscriptionPlanSchema = z.object({
  plan_name: z.string().min(1, "Plan name is required"),
  description: z.string().optional().nullable(),
  max_users: z.number().int().positive().optional().nullable(),
  max_interviews_per_month: z.number().int().positive().optional().nullable(),
  storage_limit_mb: z.number().int().positive().optional().nullable(),
  price: z.coerce.number().nonnegative("Price must be a positive number"),
  billing_interval: z.enum(["monthly", "yearly"]),
  is_active: z.boolean().optional().default(true),
});

export const updateSubscriptionPlanSchema =
  createSubscriptionPlanSchema.partial();
