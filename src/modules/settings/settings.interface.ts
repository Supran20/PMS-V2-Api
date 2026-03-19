import User from "../users/user.model";

export interface SettingsAttributes {
  id: string;
  type: string;

  created_by?: string | null;
  updated_by?: string | null;

  created_at?: Date;
  updated_at?: Date;

  // Associations
  creator?: User;
  updater?: User;
}

export interface SettingsCreationAttributes extends Partial<
  Omit<SettingsAttributes, "id" | "created_at" | "updated_at">
> {
  type: string;
}
