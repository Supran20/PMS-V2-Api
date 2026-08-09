import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";
import {
  InterviewAttributes,
  InterviewCreationAttributes,
} from "./interview.interface";
import { InterviewStatus } from "../../constants/interviewStatus";
import Guest from "../guest/guest.model";
import User from "../users/user.model";
import Studio from "../studio/studio.model";

class Interview
  extends Model<InterviewAttributes, InterviewCreationAttributes>
  implements InterviewAttributes
{
  declare id: string;

  declare guest_id: string;
  declare host_id: string;
  declare studio_id: string;

  declare interview_date: string | null;
  declare start_time: string | null;
  declare end_time: string | null;

  declare interview_status: string | null;
  declare live_status: string | null;

  declare priority: number;
  declare episode: number;
  declare status: InterviewStatus;

  declare google_drive_link: string | null;
  declare youtube_link: string | null;
  declare youtube_title: string | null;

  declare cc_user_ids: string[] | null;

  declare created_by: string | null;
  declare updated_by: string | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  declare guest?: Guest;
  declare host?: User;
  declare studio?: Studio;
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
      allowNull: true,
    },

    start_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    end_time: {
      type: DataTypes.TIME,
      allowNull: true,
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

    status: {
      type: DataTypes.ENUM(
        "scheduled",
        "postponed",
        "cancelled",
        "recorded",
        "editing",
        "post_editing",
        "published",
      ),
      allowNull: false,
      defaultValue: "scheduled",
    },

    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    episode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    google_drive_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    youtube_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    youtube_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    cc_user_ids: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: true,
      defaultValue: [],
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
