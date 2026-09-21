import { sequelize } from "../../../config/db";
import { Transaction } from "sequelize";
import Channel from "./channel.model";
import ApiError from "../../../middleware/error-handlers/ApiError";
import {
  ChannelAttributes,
  ChannelCreationAttributes,
} from "./channel.interface";
import SubscriptionPlan from "../subscription_plan/subscription_plan.model";
import bcrypt from "bcryptjs";
import User from "../../users/user.model";
import Role from "../../roles/role.model";
import { CreateChannelInput } from "./channel.validation";

class ChannelService {
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

      // users.email is globally unique
      const existingEmail = await User.findOne({
        where: { email: admin.email },
        transaction,
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

      const adminUser = await User.create(
        {
          full_name: admin.full_name,
          email: admin.email,
          password: hashedPassword,
          mobile_number: admin.mobile_number ?? null,
          status: "active",
          channel_id: channel.id,
        },
        { transaction },
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
  // UPDATE Channel by Slug
  //--------------------------------
  static async updateChannelBySlug(
    slug: string,
    data: Partial<ChannelAttributes>,
    updaterId: string,
  ): Promise<Channel> {
    const channel = await Channel.findOne({ where: { slug } });

    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }

    await channel.update({
      ...data,
      updated_by: updaterId,
    });

    return channel;
  }

  //--------------------------------
  // UPDATE Channel
  //--------------------------------
  static async updateChannel(
    id: string,
    data: Partial<ChannelAttributes>,
    updaterId: string,
  ): Promise<Channel> {
    const channel = await Channel.findByPk(id);

    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }

    await channel.update({
      ...data,
      updated_by: updaterId,
    });

    return channel;
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
