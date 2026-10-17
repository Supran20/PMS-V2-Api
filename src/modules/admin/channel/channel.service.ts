import { sequelize } from "../../../config/db";
import { Transaction } from "sequelize";
import Channel from "./channel.model";
import ApiError from "../../../middleware/error-handlers/ApiError";
import SubscriptionPlan from "../subscription_plan/subscription_plan.model";
import bcrypt from "bcryptjs";
import User from "../../users/user.model";
import Role from "../../roles/role.model";
import {
  AssignPlanInput,
  CreateChannelInput,
  UpdateChannelInput,
} from "./channel.validation";

const SUSPENDABLE_STATUSES = ["active", "trial"];

class ChannelService {
  //--------------------------------
  // Helpers
  //--------------------------------
  private static async assertPlanAssignable(
    planId: string,
    transaction?: Transaction,
  ): Promise<void> {
    const plan = await SubscriptionPlan.findByPk(planId, { transaction });

    if (!plan) {
      throw new ApiError(400, "Subscription plan not found");
    }

    if (!plan.is_active) {
      throw new ApiError(400, "Subscription plan is not active");
    }
  }

  //--------------------------------
  // CREATE Channel (+ first Super Admin user)
  //--------------------------------
  static async createChannel(
    data: CreateChannelInput,
    creatorId: string,
  ): Promise<{
    channel: Channel;
    admin: { id: string; full_name: string; email: string };
  }> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      const { admin, ...channelData } = data;

      const existing = await Channel.findOne({
        where: { slug: channelData.slug },
        transaction,
      });

      if (existing) {
        throw new ApiError(400, "Channel slug already exists");
      }

      if (channelData.status === "trial") {
        if (!channelData.trial_ends_at) {
          throw new ApiError(
            400,
            "Trial end date is required for a trial channel",
          );
        }
        if (channelData.trial_ends_at <= new Date()) {
          throw new ApiError(400, "Trial end date must be in the future");
        }
      }

      if (channelData.subscription_plan_id) {
        await ChannelService.assertPlanAssignable(
          channelData.subscription_plan_id,
          transaction,
        );
      }

      // users.email is globally unique. bypassTenantScope: true — this
      // route is platform-wide (no resolveTenant), and we're checking
      // across ALL channels by design (global uniqueness), not just one.
      const existingEmail = await User.findOne({
        where: { email: admin.email },
        transaction,
        bypassTenantScope: true,
      });

      if (existingEmail) {
        throw new ApiError(400, "Admin email already exists");
      }

      const superAdminRole = await Role.findOne({
        where: { role_name: "Super Admin" },
        transaction,
      });

      if (!superAdminRole) {
        throw new ApiError(
          500,
          "Super Admin role not found. Run the role seeder.",
        );
      }

      const channel = await Channel.create(
        {
          ...channelData,
          created_by: creatorId,
          updated_by: creatorId,
        },
        { transaction },
      );

      const hashedPassword = await bcrypt.hash(admin.password, 10);

      // bypassTenantScope: true — no context exists here (platform-wide
      // route), and channel_id is being set explicitly to the brand-new
      // channel.id below, so there's nothing for the hook to fill in anyway.
      const adminUser = await User.create(
        {
          full_name: admin.full_name,
          email: admin.email,
          password: hashedPassword,
          mobile_number: admin.mobile_number ?? null,
          status: "active",
          channel_id: channel.id,
        },
        { transaction, bypassTenantScope: true },
      );

      // Super Admin bypasses permission checks in code, so no row-level
      // permissions are set (same as UserService.createUser).
      await adminUser.addRole(superAdminRole, { transaction });

      await transaction.commit();

      return {
        channel,
        admin: {
          id: adminUser.id,
          full_name: adminUser.full_name,
          email: adminUser.email,
        },
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //--------------------------------
  // GET All Channels
  //--------------------------------
  static async getAllChannels(): Promise<Channel[]> {
    return await Channel.findAll({
      include: [{ model: SubscriptionPlan, as: "subscriptionPlan" }],
      order: [["created_at", "DESC"]],
    });
  }

  //--------------------------------
  // GET Channel by ID
  //--------------------------------
  static async getChannelById(id: string): Promise<Channel> {
    const channel = await Channel.findByPk(id, {
      include: [{ model: SubscriptionPlan, as: "subscriptionPlan" }],
    });

    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }

    return channel;
  }

  //--------------------------------
  // GET Channel by Slug
  //--------------------------------
  static async getChannelBySlug(slug: string): Promise<Channel> {
    const channel = await Channel.findOne({
      where: { slug },
      include: [{ model: SubscriptionPlan, as: "subscriptionPlan" }],
    });

    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }

    return channel;
  }

  //--------------------------------
  // UPDATE Channel by Slug (name only)
  //--------------------------------
  static async updateChannelBySlug(
    slug: string,
    data: UpdateChannelInput,
    updaterId: string,
  ): Promise<Channel> {
    const channel = await Channel.findOne({ where: { slug } });

    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }

    await channel.update({
      channel_name: data.channel_name,
      updated_by: updaterId,
    });

    return channel;
  }

  //--------------------------------
  // UPDATE Channel (name only)
  //--------------------------------
  static async updateChannel(
    id: string,
    data: UpdateChannelInput,
    updaterId: string,
  ): Promise<Channel> {
    const channel = await Channel.findByPk(id);

    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }

    await channel.update({
      channel_name: data.channel_name,
      updated_by: updaterId,
    });

    return channel;
  }

  //--------------------------------
  // ASSIGN Plan
  //--------------------------------
  static async assignPlan(
    id: string,
    data: AssignPlanInput,
    updaterId: string,
  ): Promise<Channel> {
    const channel = await Channel.findByPk(id);

    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }

    if (channel.status === "cancelled") {
      throw new ApiError(409, "Cannot change the plan of a cancelled channel");
    }

    if (data.subscription_plan_id) {
      await ChannelService.assertPlanAssignable(data.subscription_plan_id);
    }

    await channel.update({
      subscription_plan_id: data.subscription_plan_id,
      ...(data.subscription_status !== undefined && {
        subscription_status: data.subscription_status,
      }),
      ...(data.trial_ends_at !== undefined && {
        trial_ends_at: data.trial_ends_at,
      }),
      updated_by: updaterId,
    });

    return ChannelService.getChannelById(id);
  }

  //--------------------------------
  // SUSPEND Channel
  //--------------------------------
  static async suspendChannel(id: string, updaterId: string): Promise<Channel> {
    const channel = await Channel.findByPk(id);

    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }

    if (!SUSPENDABLE_STATUSES.includes(channel.status)) {
      throw new ApiError(409, `Cannot suspend a ${channel.status} channel`);
    }

    await channel.update({ status: "suspended", updated_by: updaterId });

    return ChannelService.getChannelById(id);
  }

  //--------------------------------
  // REACTIVATE Channel
  //--------------------------------
  static async reactivateChannel(
    id: string,
    updaterId: string,
  ): Promise<Channel> {
    const channel = await Channel.findByPk(id);

    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }

    if (channel.status !== "suspended") {
      throw new ApiError(409, "Only suspended channels can be reactivated");
    }

    // A channel that never got a plan and is still inside its trial window
    // goes back to trial. Everything else goes back to active.
    const hasPlan = !!channel.subscription_plan_id;
    const trialStillRunning =
      !!channel.trial_ends_at && channel.trial_ends_at > new Date();

    await channel.update({
      status: !hasPlan && trialStillRunning ? "trial" : "active",
      updated_by: updaterId,
    });

    return ChannelService.getChannelById(id);
  }

  //--------------------------------
  // DELETE Channel
  //--------------------------------
  static async deleteChannel(id: string): Promise<void> {
    const channel = await Channel.findByPk(id);

    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }

    await channel.destroy();
  }
}

export default ChannelService;
