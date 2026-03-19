import { z } from "zod";

// Validation for creating a new settings record
export const createSettingsSchema = z.object({
  type: z.string().min(1, "Type is required"),
  created_by: z.string().uuid().optional(),
  updated_by: z.string().uuid().optional(),
});

// Validation for updating a settings record
export const updateSettingsSchema = z.object({
  type: z.string().min(1, "Type is required").optional(),
  updated_by: z.string().uuid().optional(),
});
