import { z } from "zod";

const dateField = z.preprocess((value) => {
  if (value === "" || value === undefined) return undefined;
  return value;
}, z.coerce.date());

const nullableDateField = z.preprocess((value) => {
  if (value === "" || value === undefined) return undefined;
  if (value === "null" || value === null) return null;
  return value;
}, z.coerce.date().nullable());

const booleanFromString = z.preprocess((val) => {
  if (val === "true") return true;
  if (val === "false") return false;
  return val;
}, z.boolean());

const visibilityModeEnum = z.enum(["default", "range", "all"]);

export const createUserSchema = z
  .object({
    full_name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    status: z.enum(["active", "inactive"]).optional(),

    mobile_number: z
      .string()
      .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number")
      .optional(),

    enable_otp_login: booleanFromString.optional(),
    otp_in_mail: booleanFromString.optional(),
    otp_in_sms: booleanFromString.optional(),

    visibility_mode: visibilityModeEnum.optional(),
    visibility_start_date: dateField.optional(),
    visibility_end_date: dateField.optional(),

    hide_guest_contacts: booleanFromString.optional(),

    role_name: z.enum(["Admin", "Host", "Staff"]),
  })
  .superRefine((data, ctx) => {
    const {
      visibility_mode: mode,
      visibility_start_date: start,
      visibility_end_date: end,
    } = data;

    const touchingVisibility =
      mode !== undefined || start !== undefined || end !== undefined;

    if (!touchingVisibility) return;

    if (data.role_name === "Admin") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["visibility_mode"],
        message: "Visibility settings are not allowed for Admin users.",
      });
      return;
    }

    const effectiveMode = mode ?? "default";

    if (effectiveMode === "default" || effectiveMode === "all") {
      if (start !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["visibility_start_date"],
          message: `visibility_start_date is not allowed in "${effectiveMode}" mode.`,
        });
      }
      if (end !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["visibility_end_date"],
          message: `visibility_end_date is not allowed in "${effectiveMode}" mode.`,
        });
      }
      return;
    }

    // effectiveMode === "range"
    if (!start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["visibility_start_date"],
        message: "visibility_start_date is required in range mode.",
      });
      return;
    }

    if (end !== undefined) {
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["visibility_end_date"],
          message:
            "visibility_end_date must be greater than or equal to visibility_start_date.",
        });
      }

      if (end > new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["visibility_end_date"],
          message: "visibility_end_date cannot be in the future.",
        });
      }
    }
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    full_name: z.string().min(3).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    status: z.enum(["active", "inactive"]).optional(),

    mobile_number: z.string().optional(),
    enable_otp_login: booleanFromString.optional(),
    otp_in_mail: booleanFromString.optional(),
    otp_in_sms: booleanFromString.optional(),

    visibility_mode: visibilityModeEnum.optional(),
    visibility_start_date: nullableDateField.optional(),
    visibility_end_date: nullableDateField.optional(),

    hide_guest_contacts: booleanFromString.optional(),

    role_name: z.enum(["Admin", "Host", "Staff"]).optional(),
  })
  .superRefine((data, ctx) => {
    const {
      visibility_mode: mode,
      visibility_start_date: start,
      visibility_end_date: end,
    } = data;

    const touchingVisibility =
      mode !== undefined || start !== undefined || end !== undefined;

    if (!touchingVisibility) return;

    if (data.role_name === "Admin") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["visibility_mode"],
        message: "Visibility settings are not allowed for Admin users.",
      });
      return;
    }

    const effectiveMode = mode ?? "default";

    if (effectiveMode === "default" || effectiveMode === "all") {
      if (start !== undefined && start !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["visibility_start_date"],
          message: `visibility_start_date is not allowed in "${effectiveMode}" mode.`,
        });
      }
      if (end !== undefined && end !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["visibility_end_date"],
          message: `visibility_end_date is not allowed in "${effectiveMode}" mode.`,
        });
      }
      return;
    }

    // effectiveMode === "range"
    if (!start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["visibility_start_date"],
        message: "visibility_start_date is required in range mode.",
      });
      return;
    }

    if (start instanceof Date && end instanceof Date) {
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["visibility_end_date"],
          message:
            "visibility_end_date must be greater than or equal to visibility_start_date.",
        });
      }

      if (end > new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["visibility_end_date"],
          message: "visibility_end_date cannot be in the future.",
        });
      }
    }
  });
