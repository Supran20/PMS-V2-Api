import { Response } from "express";
import { AuthRequest } from "../../middleware/authenticate.middleware";
import UserService from "./user.service";
import { createUserSchema, updateUserSchema } from "./user.validation";

export class UserController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const validated = createUserSchema.parse(req.body);

      const user = await UserService.createUser(validated);

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getAll(req: AuthRequest, res: Response) {
    try {
      const users = await UserService.getAllUsers();

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const user = await UserService.getUserById(String(req.params.id));

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const validated = updateUserSchema.parse(req.body);

      const user = await UserService.updateUser(
        String(req.params.id),
        validated,
      );

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      await UserService.deleteUser(String(req.params.id));

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}
