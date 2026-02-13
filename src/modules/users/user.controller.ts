import { Request, Response } from "express";
import { createUserService } from "./user.service";
import { createUserSchema } from "./user.validation";

export const createUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validatedData = createUserSchema.parse(req.body);

    const user = await createUserService(validatedData);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
