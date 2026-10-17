import { Response } from "express";
import { AuthRequest } from "../../../middleware/authenticate.middleware";
import { sendError } from "../../../middleware/error-handlers/sendError";
import SubscriptionPlanService from "./subscription_plan.service";
import {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
} from "./subscription_plan.validation";

export class SubscriptionPlanController {
  //--------------------------------
  // CREATE Subscription Plan
  //--------------------------------
  static async create(req: AuthRequest, res: Response) {
    try {
      const validated = createSubscriptionPlanSchema.parse(req.body);

      const plan = await SubscriptionPlanService.createSubscriptionPlan(
        validated,
        req.user.id,
      );

      res.status(201).json({
        success: true,
        message: "Subscription plan created successfully",
        data: plan,
      });
    } catch (error) {
      sendError(res, error);
    }
  }

  //--------------------------------
  // GET All Subscription Plans
  //--------------------------------
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const plans = await SubscriptionPlanService.getAllSubscriptionPlans();

      res.status(200).json({ success: true, data: plans });
    } catch (error) {
      sendError(res, error);
    }
  }

  //--------------------------------
  // GET Subscription Plan by ID
  //--------------------------------
  static async getById(req: AuthRequest, res: Response) {
    try {
      const plan = await SubscriptionPlanService.getSubscriptionPlanById(
        String(req.params.id),
      );

      res.status(200).json({ success: true, data: plan });
    } catch (error) {
      sendError(res, error);
    }
  }

  //--------------------------------
  // UPDATE Subscription Plan
  //--------------------------------
  static async update(req: AuthRequest, res: Response) {
    try {
      const validated = updateSubscriptionPlanSchema.parse(req.body);

      const plan = await SubscriptionPlanService.updateSubscriptionPlan(
        String(req.params.id),
        validated,
        req.user.id,
      );

      res.status(200).json({
        success: true,
        message: "Subscription plan updated successfully",
        data: plan,
      });
    } catch (error) {
      sendError(res, error);
    }
  }

  //--------------------------------
  // DELETE Subscription Plan
  //--------------------------------
  static async delete(req: AuthRequest, res: Response) {
    try {
      await SubscriptionPlanService.deleteSubscriptionPlan(
        String(req.params.id),
      );

      res.status(200).json({
        success: true,
        message: "Subscription plan deleted successfully",
      });
    } catch (error) {
      sendError(res, error);
    }
  }
}
