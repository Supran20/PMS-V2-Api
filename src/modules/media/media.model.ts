import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/db";
import { IMedia } from "./media.interface";

export interface MediaCreationAttributes extends Optional<
  IMedia,
  "id" | "tag_id" | "created_by" | "updated_by" | "created_at" | "updated_at"
> {}
class Media extends Model<IMedia, MediaCreationAttributes> implements IMedia {
  declare id: string;
  declare media_name: string;
  declare path: string;
  declare type: string;

  declare tag_id: string | null;

  declare created_at: Date;
  declare updated_at: Date;

  declare created_by: string | null;
  declare updated_by: string | null;
}

Media.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    media_name: { type: DataTypes.TEXT, allowNull: false },
    path: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },

    tag_id: {
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
    tableName: "media",
    timestamps: false, // using manual timestamps
  },
);

export default Media;
