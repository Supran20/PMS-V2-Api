import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/db";
import {
  PermissionSettingsAttributes,
  PermissionSettingsCreationAttributes,
} from "./permission_set.interface";
import User from "../../users/user.model";
import Settings from "../../settings/settings.model";

class PermissionSettings
  extends Model<
    PermissionSettingsAttributes,
    PermissionSettingsCreationAttributes
  >
  implements PermissionSettingsAttributes
{
  declare id: string;
  declare settings_id: string;
  declare permission_type: string;
  declare user_ids: string[];

  declare created_by: string | null;
  declare updated_by: string | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  // Associations
  declare creator?: User;
  declare updater?: User;
  declare settings?: Settings;
  declare users?: User[];
}

PermissionSettings.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    settings_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    permission_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_ids: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
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
    tableName: "permission_settings",
    timestamps: true,
    underscored: true,
  },
);

export default PermissionSettings;
