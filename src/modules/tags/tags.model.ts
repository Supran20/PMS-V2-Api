import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/db";
import { ITag } from "./tags.interface";
import Channel from "../admin/channel/channel.model";

export interface TagCreationAttributes extends Optional<
  ITag,
  "id" | "created_by" | "updated_by" | "created_at" | "updated_at"
> {}

class Tags extends Model<ITag, TagCreationAttributes> implements ITag {
  declare id: string;
  declare channel_id: string;
  declare tag_name: string;
  declare slug: string;

  declare created_at: Date;
  declare updated_at: Date;

  declare created_by?: string | null;
  declare updated_by?: string | null;
  declare channel?: Channel;
}

Tags.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    channel_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "channels", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    tag_name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },

    created_by: { type: DataTypes.UUID, allowNull: true },
    updated_by: { type: DataTypes.UUID, allowNull: true },

    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "tags",
    timestamps: false, // manual timestamps
    underscored: true,
  },
);

export default Tags;
