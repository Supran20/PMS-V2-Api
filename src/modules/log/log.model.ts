import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";
import { LogAttributes, LogCreationAttributes } from "./log.interface";
import User from "../users/user.model";

class Log
  extends Model<LogAttributes, LogCreationAttributes>
  implements LogAttributes
{
  declare id: string;

  declare event_type: string;
  declare recipient_email: string;
  declare status: "pending" | "sent" | "failed";

  declare error_message: any | null;
  declare sent_at: Date | null;

  declare created_by: string | null;
  declare updated_by: string | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  // Associations
  declare creator?: User;
  declare updater?: User;
}

Log.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    event_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    recipient_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    error_message: {
      type: DataTypes.JSONB,
      allowNull: true,
    },

    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
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

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "logs",
    timestamps: true,
    underscored: true,
  },
);

export default Log;
