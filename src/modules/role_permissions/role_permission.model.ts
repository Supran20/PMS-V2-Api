import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/db";
import Role from "../roles/role.model";
import Permission from "../permissions/permission.model";

export interface RolePermissionAttributes {
  id: string;
  role_id: string;
  permission_id: string;
  granted_at?: Date;
}

export interface RolePermissionCreationAttributes extends Optional<
  RolePermissionAttributes,
  "id" | "granted_at"
> {}

class RolePermission
  extends Model<RolePermissionAttributes, RolePermissionCreationAttributes>
  implements RolePermissionAttributes
{
  declare id: string;
  declare role_id: string;
  declare permission_id: string;
  declare granted_at?: Date;
}

RolePermission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role_id: {
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
    tableName: "role_permissions",
    sequelize,
    timestamps: false,
  },
);

export default RolePermission;
