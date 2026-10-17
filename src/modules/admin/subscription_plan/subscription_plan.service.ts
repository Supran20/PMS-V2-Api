import { sequelize } from "../../../config/db";
import { Op, Transaction } from "sequelize";
import SubscriptionPlan from "./subscription_plan.model";
import Channel from "../channel/channel.model";
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
  // GET All Subscription Plans (+ channel_count per plan)
  //--------------------------------
  static async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await SubscriptionPlan.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(
              `(SELECT COUNT(*)::int FROM channels WHERE channels.subscription_plan_id = "SubscriptionPlan"."id")`,
            ),
            "channel_count",
          ],
        ],
      },
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

    if (data.plan_name && data.plan_name !== plan.plan_name) {
      const duplicate = await SubscriptionPlan.findOne({
        where: { plan_name: data.plan_name, id: { [Op.ne]: id } },
      });

      if (duplicate) {
        throw new ApiError(400, "Plan name already exists");
      }
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

    // The FK is ON DELETE SET NULL, so without this check deleting a plan
    // would silently strip it from every channel using it.
    const channelCount = await Channel.count({
      where: { subscription_plan_id: id },
    });

    if (channelCount > 0) {
      throw new ApiError(
        409,
        `Plan is assigned to ${channelCount} channel(s). Deactivate it instead.`,
      );
    }

    await plan.destroy();
  }
}

export default SubscriptionPlanService;
