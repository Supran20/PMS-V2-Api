import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";
import {
  UserPermissionAttributes,
  UserPermissionCreationAttributes,
} from "./user_permission.interface";

export class UserPermission
  extends Model<UserPermissionAttributes, UserPermissionCreationAttributes>
  implements UserPermissionAttributes
{
  declare id: string;
  declare user_id: string;
  declare permission_id: string;
  declare granted_at: Date;
}

UserPermission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    permission_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    granted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "user_permissions",
    timestamps: false,
  },
);

export default UserPermission;
