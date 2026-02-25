import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";
import { StudioAttributes, StudioCreationAttributes } from "./studio.interface";
import User from "../users/user.model";

class Studio
  extends Model<StudioAttributes, StudioCreationAttributes>
  implements StudioAttributes
{
  declare id: string;
  declare studio_name: string;
  declare address: string | null;
  declare slug: string;

  declare created_by: string | null;
  declare updated_by: string | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  declare creator?: User;
}

Studio.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    studio_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    slug: { type: DataTypes.STRING, allowNull: false, unique: true },

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
  },
);

export default Studio;
