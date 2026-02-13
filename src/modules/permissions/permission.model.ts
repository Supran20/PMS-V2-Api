import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/db";
import RolePermission from "../role_permissions/role_permission.model";

export interface PermissionAttributes {
  id: string;
  permission_type: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface PermissionCreationAttributes extends Optional<
  PermissionAttributes,
  "id" | "description" | "created_at" | "updated_at"
> {}

class Permission
  extends Model<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes
{
  declare id: string;
  declare permission_type: string;
  declare description?: string;
  declare created_at?: Date;
  declare updated_at?: Date;
}

Permission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    permission_type: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Per DB diagram
    },
    description: {
      type: DataTypes.TEXT,
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
    tableName: "permissions",
    sequelize,
    timestamps: false, // since created_at and updated_at handled manually
  },
);

export default Permission;
