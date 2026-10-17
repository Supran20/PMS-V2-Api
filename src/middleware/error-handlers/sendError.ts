import { Response } from "express";
import { ZodError } from "zod";
import ApiError from "./ApiError";

export const sendError = (res: Response, error: unknown) => {
  if (error instanceof ApiError) {
    return res
      .status(error.statusCode)
      .json({ success: false, message: error.message });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: error.issues.map((issue) => issue.message).join(", "),
    });
  }

  const message =
    error instanceof Error ? error.message : "Something went wrong";
  return res.status(500).json({ success: false, message });
};
