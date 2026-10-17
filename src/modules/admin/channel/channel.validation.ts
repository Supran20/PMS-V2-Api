import { z } from "zod";

const channelAdminSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  mobile_number: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number")
    .optional(),
});

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug is required")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug can only contain lowercase letters, numbers and single hyphens",
  );

const subscriptionStatusSchema = z.enum([
  "trialing",
  "active",
  "past_due",
  "cancelled",
]);

export const createChannelSchema = z.object({
  channel_name: z.string().trim().min(1, "Channel name is required"),
  slug: slugSchema,
  // A channel can't be created as suspended/cancelled. Those states are
  // reached via the suspend endpoint (or a future cancel flow).
  status: z.enum(["active", "trial"]).default("trial"),
  subscription_plan_id: z.string().uuid().optional().nullable(),
  subscription_status: subscriptionStatusSchema.optional().nullable(),
  trial_ends_at: z.coerce.date().optional().nullable(),

  admin: channelAdminSchema,
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;

// Only the name is editable here. Slug is immutable (it can appear in URLs),
// and status/plan changes go through the dedicated endpoints so their
// guardrails can't be bypassed.
export const updateChannelSchema = z.object({
  channel_name: z.string().trim().min(1, "Channel name is required"),
});

export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;

export const assignPlanSchema = z.object({
  // null clears the plan.
  subscription_plan_id: z.string().uuid().nullable(),
  subscription_status: subscriptionStatusSchema.optional().nullable(),
  trial_ends_at: z.coerce.date().optional().nullable(),
});

export type AssignPlanInput = z.infer<typeof assignPlanSchema>;
