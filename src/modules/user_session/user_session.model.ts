import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";
import {
  UserSessionAttributes,
  UserSessionCreationAttributes,
} from "./user_session.interface";
import User from "../users/user.model";

export class UserSession
  extends Model<UserSessionAttributes, UserSessionCreationAttributes>
  implements UserSessionAttributes
{
  declare id: string;
  declare user_id: string;
  declare refresh_token: string;
  declare device_info?: string | null;
  declare expires_at: Date;
  declare revoked_at?: Date | null;

  declare created_at: Date;
  declare updated_at: Date;
}

UserSession.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    device_info: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revoked_at: {
      type: DataTypes.DATE,
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
    tableName: "user_sessions",
    timestamps: false,
  },
);

export default UserSession;
