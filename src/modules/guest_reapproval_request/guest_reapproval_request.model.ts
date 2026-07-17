import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";
import {
  GuestReapprovalRequestAttributes,
  GuestReapprovalRequestCreationAttributes,
} from "./guest_reapproval_request.interface";

class GuestReapprovalRequest
  extends Model<
    GuestReapprovalRequestAttributes,
    GuestReapprovalRequestCreationAttributes
  >
  implements GuestReapprovalRequestAttributes
{
  declare id: string;

  declare guest_id: string;
  declare requested_by: string;
  declare proposed_host_id: string | null;
  declare interview_id: string | null;

  declare trigger_source: "duplicate_guest_attempt" | "repeat_booking";
  declare status: "pending" | "approved" | "rejected";

  declare reviewed_by: string | null;
  declare reviewed_at: Date | null;
  declare review_note: string | null;

  declare created_by: string | null;
  declare updated_by: string | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

GuestReapprovalRequest.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    guest_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    requested_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    proposed_host_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    interview_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    trigger_source: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },

    reviewed_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    review_note: {
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
    modelName: "GuestReapprovalRequest",
    tableName: "guest_reapproval_requests",
    timestamps: true,
    underscored: true,
  },
);

export default GuestReapprovalRequest;
