import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/db";
import {
  SubscriptionPlanAttributes,
  SubscriptionPlanCreationAttributes,
} from "./subscription_plan.interface";
import User from "../../users/user.model";

class SubscriptionPlan
  extends Model<SubscriptionPlanAttributes, SubscriptionPlanCreationAttributes>
  implements SubscriptionPlanAttributes
{
  declare id: string;
  declare plan_name: string;
  declare description: string | null;
  declare max_users: number | null;
  declare max_interviews_per_month: number | null;
  declare storage_limit_mb: number | null;
  declare price: number;
  declare billing_interval: string;
  declare is_active: boolean;

  declare created_by: string | null;
  declare updated_by: string | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  declare creator?: User;
}

SubscriptionPlan.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    plan_name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    max_users: { type: DataTypes.INTEGER, allowNull: true },
    max_interviews_per_month: { type: DataTypes.INTEGER, allowNull: true },
    storage_limit_mb: { type: DataTypes.INTEGER, allowNull: true },
    price: { type: DataTypes.DECIMAL, allowNull: false },
    billing_interval: { type: DataTypes.STRING, allowNull: false },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

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
    modelName: "SubscriptionPlan",
    tableName: "subscription_plans",
    timestamps: true,
    underscored: true,
  },
);

export default SubscriptionPlan;
