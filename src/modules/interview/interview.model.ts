import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";
import {
  InterviewAttributes,
  InterviewCreationAttributes,
} from "./interview.interface";

class Interview
  extends Model<InterviewAttributes, InterviewCreationAttributes>
  implements InterviewAttributes
{
  declare id: string;

  declare guest_id: string;
  declare host_id: string;
  declare studio_id: string;

  declare interview_date: string;
  declare start_time: string;
  declare end_time: string;

  declare interview_status: string | null;
  declare live_status: string | null;

  declare google_drive_link: string | null;
  declare youtube_link: string | null;

  declare created_by: string | null;
  declare updated_by: string | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Interview.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    guest_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "guests", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    host_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    studio_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "studios", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    interview_date: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    interview_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "scheduled",
    },

    live_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "not_live",
    },

    google_drive_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    youtube_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },

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
    modelName: "Interview",
    tableName: "interviews",
    timestamps: true,
    underscored: true,
  },
);

export default Interview;
