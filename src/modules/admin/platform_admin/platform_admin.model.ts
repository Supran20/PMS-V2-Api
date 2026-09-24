import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/db";
import {
  PlatformAdminAttributes,
  PlatformAdminCreationAttributes,
} from "./platform_admin.interface";
import User from "../../users/user.model";

class PlatformAdmin
  extends Model<PlatformAdminAttributes, PlatformAdminCreationAttributes>
  implements PlatformAdminAttributes
{
  declare id: string;
  declare user_id: string;

  declare created_by: string | null;
  declare updated_by: string | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  declare user?: User;
  declare creator?: User;
}

PlatformAdmin.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
    modelName: "PlatformAdmin",
    tableName: "platform_admins",
    timestamps: true,
    underscored: true,
  },
);

export default PlatformAdmin;
