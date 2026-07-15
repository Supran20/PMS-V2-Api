import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/db";
import Role from "../roles/role.model";
import {
  BelongsToManyAddAssociationMixin,
  BelongsToManySetAssociationsMixin,
} from "sequelize";
import { UserAttributes, UserCreationAttributes } from "./user.interface";

// Define Sequelize Model for User
export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: string;
  declare full_name: string;
  declare email: string;
  declare password: string;
  declare status: string | null;
  declare email_verify_at: Date | null;
  declare otp: string | null;
  declare otp_expires_at: Date | null;
  declare remember_token: string | null;
  declare remember_token_expires_at: Date | null;
  declare remember_until: Date | null;
  declare profile_image: string | null;
  declare mobile_number: string | null;
  declare enable_otp_login: boolean;
  declare otp_in_sms: boolean;
  declare otp_in_mail: boolean;

  declare visibility_mode: "default" | "range" | "all";

  declare visibility_start_date: Date | null;
  declare visibility_end_date: Date | null;

  declare created_at: Date;
  declare updated_at: Date;

  declare roles?: Role[];
  declare addRole: BelongsToManyAddAssociationMixin<Role, string>;
  declare setRoles: BelongsToManySetAssociationsMixin<Role, string>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "active",
    },
    email_verify_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otp_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    remember_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remember_token_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    remember_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    profile_image: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    mobile_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    enable_otp_login: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    otp_in_sms: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    otp_in_mail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    visibility_mode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default",
    },
    visibility_start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    visibility_end_date: {
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
    tableName: "users",
    timestamps: false,
  },
);

export default User;
