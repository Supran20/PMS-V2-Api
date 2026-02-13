import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";
import { GuestAttributes, GuestCreationAttributes } from "./guest.interface";

class Guest
  extends Model<GuestAttributes, GuestCreationAttributes>
  implements GuestAttributes
{
  declare id: string;

  declare full_name: string;
  declare designation: string | null;
  declare slug: string;
  declare bio: string | null;

  declare social_media: Record<string, any> | null;
  declare email: string | null;
  declare phone: string | null;

  declare approved: boolean;

  declare referred_by: string | null;
  declare profile_image: string | null;

  declare created_by: string | null;
  declare updated_by: string | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Guest.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    designation: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    social_media: {
      type: DataTypes.JSONB,
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    referred_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    profile_image: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Guest",
    tableName: "guests",
    timestamps: true,
    underscored: true,
  },
);

export default Guest;
