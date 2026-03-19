import User from "../../users/user.model";
import Settings from "../../settings/settings.model";

export interface PermissionSettingsAttributes {
  id: string;
  settings_id: string;
  permission_type: string;
  user_ids: string[]; // array of UUIDs

  created_by?: string | null;
  updated_by?: string | null;

  created_at?: Date;
  updated_at?: Date;

  // Associations
  creator?: User;
  updater?: User;
  settings?: Settings;
}

export interface PermissionSettingsCreationAttributes extends Partial<
  Omit<PermissionSettingsAttributes, "id" | "created_at" | "updated_at">
> {
  settings_id: string;
  permission_type: string;
  user_ids: string[];
}
