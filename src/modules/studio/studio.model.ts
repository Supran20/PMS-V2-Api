import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";
import { StudioAttributes, StudioCreationAttributes } from "./studio.interface";
import User from "../users/user.model";
import Channel from "../admin/channel/channel.model";

class Studio
  extends Model<StudioAttributes, StudioCreationAttributes>
  implements StudioAttributes
{
  declare id: string;
  declare channel_id: string;
  declare studio_name: string;
  declare address: string | null;
  declare slug: string;

  declare created_by: string | null;
  declare updated_by: string | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  declare creator?: User;
  declare channel?: Channel;
}

Studio.init(
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
      onDelete: "CASCADE", // Log uses CASCADE too — that's already decided
    },
    studio_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    slug: { type: DataTypes.STRING, allowNull: false },

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
    modelName: "Studio",
    tableName: "studios",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["channel_id", "slug"],
        name: "studios_channel_id_slug_unique",
      },
    ],
  },
);

export default Studio;
