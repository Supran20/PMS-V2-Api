import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/db";
import User from "../users/user.model";
import Role from "../roles/role.model";

// -----------------------------
// 1️⃣ Define Model Attributes Interface
// -----------------------------
export interface UserRoleAttributes {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: Date;
}

// -----------------------------
// 2️⃣ Optional fields when creating a UserRole
// -----------------------------
export type UserRoleCreationAttributes = Optional<
  UserRoleAttributes,
  "id" | "assigned_at"
>;

// -----------------------------
// 3️⃣ Define the Sequelize Model Class
// -----------------------------
export class UserRole
  extends Model<UserRoleAttributes, UserRoleCreationAttributes>
  implements UserRoleAttributes
{
  declare id: string;
  declare user_id: string;
  declare role_id: string;
  declare assigned_at: Date;
  declare Role?: Role;
}

// -----------------------------
// 4️⃣ Initialize Model
// -----------------------------
UserRole.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Role,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "user_roles",
    timestamps: false,
  },
);

export default UserRole;
