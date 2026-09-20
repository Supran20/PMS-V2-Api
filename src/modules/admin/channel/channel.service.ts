import { sequelize } from "../../../config/db";
import { Transaction } from "sequelize";
import Channel from "./channel.model";
import ApiError from "../../../middleware/error-handlers/ApiError";
import {
  ChannelAttributes,
  ChannelCreationAttributes,
} from "./channel.interface";
import SubscriptionPlan from "../subscription_plan/subscription_plan.model";

class ChannelService {
  //--------------------------------
  // CREATE Channel
  //--------------------------------
  static async createChannel(
    data: ChannelCreationAttributes,
    creatorId: string,
  ): Promise<Channel> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      const existing = await Channel.findOne({
        where: { slug: data.slug },
        transaction,
      });

      if (existing) {
        throw new ApiError(400, "Channel slug already exists");
      }

      const channel = await Channel.create(
        {
          ...data,
          created_by: creatorId,
          updated_by: creatorId,
        },
        { transaction },
      );

      await transaction.commit();
      return channel;
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
