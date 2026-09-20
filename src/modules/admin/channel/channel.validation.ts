import { z } from "zod";

export const createChannelSchema = z.object({
  channel_name: z.string().min(1, "Channel name is required"),
  slug: z.string().min(1, "Slug is required"),
  status: z
    .enum(["active", "suspended", "trial", "cancelled"])
    .default("trial"),
  subscription_plan_id: z.string().uuid().optional().nullable(),
  subscription_status: z
    .enum(["trialing", "active", "past_due", "cancelled"])
    .optional()
    .nullable(),
  trial_ends_at: z.coerce.date().optional().nullable(),
});

export const updateChannelSchema = createChannelSchema.partial();
