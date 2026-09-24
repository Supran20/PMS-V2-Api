import { sequelize } from "../../../config/db";
import { Transaction } from "sequelize";
import SubscriptionPlan from "./subscription_plan.model";
import ApiError from "../../../middleware/error-handlers/ApiError";
import {
  SubscriptionPlanAttributes,
  SubscriptionPlanCreationAttributes,
} from "./subscription_plan.interface";

class SubscriptionPlanService {
  //--------------------------------
  // CREATE Subscription Plan
  //--------------------------------
  static async createSubscriptionPlan(
    data: SubscriptionPlanCreationAttributes,
    creatorId: string,
  ): Promise<SubscriptionPlan> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      const existing = await SubscriptionPlan.findOne({
        where: { plan_name: data.plan_name },
        transaction,
      });

      if (existing) {
        throw new ApiError(400, "Plan name already exists");
      }

      const plan = await SubscriptionPlan.create(
        {
          ...data,
          created_by: creatorId,
          updated_by: creatorId,
        },
        { transaction },
      );

      await transaction.commit();
      return plan;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //--------------------------------
  // GET All Subscription Plans
  //--------------------------------
  static async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await SubscriptionPlan.findAll({
      order: [["created_at", "DESC"]],
    });
  }

  //--------------------------------
  // GET Subscription Plan by ID
  //--------------------------------
  static async getSubscriptionPlanById(id: string): Promise<SubscriptionPlan> {
    const plan = await SubscriptionPlan.findByPk(id);

    if (!plan) {
      throw new ApiError(404, "Subscription plan not found");
    }

    return plan;
  }

  //--------------------------------
  // UPDATE Subscription Plan
  //--------------------------------
  static async updateSubscriptionPlan(
    id: string,
    data: Partial<SubscriptionPlanAttributes>,
    updaterId: string,
  ): Promise<SubscriptionPlan> {
    const plan = await SubscriptionPlan.findByPk(id);

    if (!plan) {
      throw new ApiError(404, "Subscription plan not found");
    }

    await plan.update({
      ...data,
      updated_by: updaterId,
    });

    return plan;
  }

  //--------------------------------
  // DELETE Subscription Plan
  //--------------------------------
  static async deleteSubscriptionPlan(id: string): Promise<void> {
    const plan = await SubscriptionPlan.findByPk(id);

    if (!plan) {
      throw new ApiError(404, "Subscription plan not found");
    }

    await plan.destroy();
  }
}

export default SubscriptionPlanService;
