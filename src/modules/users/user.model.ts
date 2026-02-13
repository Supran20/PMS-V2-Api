import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/db";
import Role from "../roles/role.model";
import { BelongsToManyAddAssociationMixin } from "sequelize";

// Define attributes for User model
export interface UserAttributes {
  id: string;
  full_name: string;
  username: string;
  email: string;
  password: string;
  status: string | null;
  email_verify_at: Date | null;
  otp: string | null;
  otp_expires_at: Date | null;
  remember_token: string | null;
  profile_image: string | null;
  mobile_number: string | null;
  enable_otp_login: boolean;
  otp_in_sms: boolean;
  otp_in_mail: boolean;
  created_at: Date;
  updated_at: Date;
}

// Define optional fields for User creation
export type UserCreationAttributes = Optional<
  UserAttributes,
  | "id"
  | "status"
  | "email_verify_at"
  | "otp"
  | "otp_expires_at"
  | "remember_token"
  | "profile_image"
  | "mobile_number"
  | "enable_otp_login"
  | "otp_in_sms"
  | "otp_in_mail"
  | "created_at"
  | "updated_at"
>;

// Define Sequelize Model for User
export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: string;
  declare full_name: string;
  declare username: string;
  declare email: string;
  declare password: string;
  declare status: string | null;
  declare email_verify_at: Date | null;
  declare otp: string | null;
  declare otp_expires_at: Date | null;
  declare remember_token: string | null;
  declare profile_image: string | null;
  declare mobile_number: string | null;
  declare enable_otp_login: boolean;
  declare otp_in_sms: boolean;
  declare otp_in_mail: boolean;
  declare created_at: Date;
  declare updated_at: Date;

  declare roles?: Role[];
  declare addRole: BelongsToManyAddAssociationMixin<Role, string>;
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
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
    profile_image: {
      type: DataTypes.STRING,
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
