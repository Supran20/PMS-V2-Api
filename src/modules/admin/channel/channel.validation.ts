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

  admin: channelAdminSchema,
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;

// `admin` is only valid at creation time, so it is omitted from updates.
export const updateChannelSchema = createChannelSchema
  .omit({ admin: true })
  .partial();
