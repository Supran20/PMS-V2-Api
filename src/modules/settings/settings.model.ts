import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";
import {
  SettingsAttributes,
  SettingsCreationAttributes,
} from "./settings.interface";
import User from "../users/user.model";

class Settings
  extends Model<SettingsAttributes, SettingsCreationAttributes>
  implements SettingsAttributes
{
  declare id: string;
  declare type: string;

  declare created_by: string | null;
  declare updated_by: string | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  // Associations
  declare creator?: User;
  declare updater?: User;
}

Settings.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
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
    tableName: "settings",
    timestamps: true,
    underscored: true,
  },
);

export default Settings;
