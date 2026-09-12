import { Optional } from "sequelize";

export interface UserPermissionAttributes {
  id: string;
  user_id: string;
  permission_id: string;
  granted_at: Date;
}

export interface UserPermissionCreationAttributes extends Optional<
  UserPermissionAttributes,
  "id" | "granted_at"
> {}
