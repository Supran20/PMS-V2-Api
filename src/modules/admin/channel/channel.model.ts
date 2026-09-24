import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/db";
import {
  ChannelAttributes,
  ChannelCreationAttributes,
} from "./channel.interface";
import User from "../../users/user.model";
import SubscriptionPlan from "../subscription_plan/subscription_plan.model";

class Channel
  extends Model<ChannelAttributes, ChannelCreationAttributes>
  implements ChannelAttributes
{
  declare id: string;
  declare channel_name: string;
  declare slug: string;
  declare status: string;
  declare subscription_plan_id: string | null;
  declare subscription_status: string | null;
  declare trial_ends_at: Date | null;

  declare created_by: string | null;
  declare updated_by: string | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  declare creator?: User;
  declare subscriptionPlan?: SubscriptionPlan;
}

Channel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    channel_name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    status: { type: DataTypes.STRING, allowNull: false },
    subscription_plan_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "subscription_plans", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    subscription_status: { type: DataTypes.STRING, allowNull: true },
    trial_ends_at: { type: DataTypes.DATE, allowNull: true },

    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  {
    sequelize,
    modelName: "Channel",
    tableName: "channels",
    timestamps: true,
    underscored: true,
  },
);

export default Channel;
