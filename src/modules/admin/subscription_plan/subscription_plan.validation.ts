import { z } from "zod";

const planBaseSchema = z.object({
  plan_name: z.string().trim().min(1, "Plan name is required"),
  description: z.string().optional().nullable(),
  max_users: z.number().int().positive().optional().nullable(),
  max_interviews_per_month: z.number().int().positive().optional().nullable(),
  storage_limit_mb: z.number().int().positive().optional().nullable(),
  price: z.coerce.number().nonnegative("Price must be a positive number"),
  billing_interval: z.enum(["monthly", "yearly"]),
});

export const createSubscriptionPlanSchema = planBaseSchema.extend({
  is_active: z.boolean().optional().default(true),
});

// Built from the base (no default on is_active) so a partial update never
// resets is_active to true when the field is omitted.
export const updateSubscriptionPlanSchema = planBaseSchema
  .extend({ is_active: z.boolean() })
  .partial();
