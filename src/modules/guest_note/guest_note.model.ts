import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";

import {
  GuestNoteAttributes,
  GuestNoteCreationAttributes,
} from "./guest_note.interface";

class GuestNote
  extends Model<GuestNoteAttributes, GuestNoteCreationAttributes>
  implements GuestNoteAttributes
{
  declare id: string;

  declare description: string | null;
  declare guest_id: string;

  declare title: string;

  declare created_by: string | null;
  declare updated_by: string | null;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

GuestNote.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    guest_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
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
    tableName: "guest_notes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default GuestNote;
