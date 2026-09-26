import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";
import { GuestAttributes, GuestCreationAttributes } from "./guest.interface";
import Channel from "../admin/channel/channel.model";

class Guest
  extends Model<GuestAttributes, GuestCreationAttributes>
  implements GuestAttributes
{
  declare id: string;
  declare channel_id: string;
  declare full_name: string;
  declare designation: string | null;
  declare slug: string;
  declare bio: string | null;

  declare social_media: Record<string, any> | null;

  declare email: string | null;
  declare phone: string | null;

  declare approved: boolean;
  declare approved_by: string | null;

  declare referred_by: string | null;
  declare profile_image: string | null;
  declare tags: string[] | null;
  declare tag_ids: string[] | null;

  declare host_id: string | null;

  declare created_by: string | null;
  declare updated_by: string | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  declare channel?: Channel;
}

Guest.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    channel_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "channels", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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

    approved_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "not_started",
        "contacted",
        "follow_up",
        "confirmed",
      ),
      allowNull: false,
      defaultValue: "not_started",
    },

    record: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    rejected: {
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

    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },

    tag_ids: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: true,
      defaultValue: [],
    },

    host_id: {
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
    indexes: [
      {
        unique: true,
        fields: ["channel_id", "slug"],
        name: "guests_channel_id_slug_unique",
      },
    ],
  },
);

export default Guest;
