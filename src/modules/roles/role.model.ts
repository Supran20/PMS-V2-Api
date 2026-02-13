// src/modules/roles/models/role.model.ts

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/db";
import Permission from "../permissions/permission.model";

// -----------------------------
// 1️⃣ Define Model Attributes Interface
// -----------------------------
export interface RoleAttributes {
  id: string;
  role_name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

// -----------------------------
// 2️⃣ Optional fields when creating a Role
// -----------------------------
export type RoleCreationAttributes = Optional<
  RoleAttributes,
  "id" | "description" | "created_at" | "updated_at"
>;

// -----------------------------
// 3️⃣ Define the Sequelize Model Class
// -----------------------------
export class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  declare id: string;
  declare role_name: string;
  declare description: string | null;
  declare created_at: Date;
  declare updated_at: Date;
  declare permissions?: Permission[];
}

// -----------------------------
// 4️⃣ Initialize Model
// -----------------------------
Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role_name: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    sequelize,
    tableName: "roles",
    timestamps: false, // manually handle created_at and updated_at
  },
);

export default Role;
