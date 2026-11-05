import { z } from "zod";

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// "" clears the field (stored as null); undefined leaves it unchanged.
const optionalUrl = z
  .string()
  .trim()
  .max(300, "Link is too long")
  .refine(
    (value) => value === "" || isHttpUrl(value),
    "Enter a valid link starting with http:// or https://",
  )
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

const optionalDescription = z
  .string()
  .trim()
  .max(500, "Description must be 500 characters or less")
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

export const updateMyChannelSchema = z
  .object({
    channel_name: z
      .string()
      .trim()
      .min(2, "Channel name must be at least 2 characters")
      .max(100, "Channel name must be 100 characters or less"),
    description: optionalDescription,
    social_links: z
      .object({
        youtube: optionalUrl,
        spotify: optionalUrl,
        instagram: optionalUrl,
        website: optionalUrl,
      })
      .strict()
      .optional(),
  })
  .strict();

export type UpdateMyChannelInput = z.infer<typeof updateMyChannelSchema>;
