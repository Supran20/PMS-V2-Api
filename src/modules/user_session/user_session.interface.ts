export interface UserSessionAttributes {
  id: string;
  user_id: string;
  refresh_token: string; // hashed token
  device_info?: string | null; // optional for device/browser info
  expires_at: Date;
  revoked_at?: Date | null;

  created_at?: Date;
  updated_at?: Date;
}

export interface UserSessionCreationAttributes extends Partial<
  Omit<UserSessionAttributes, "id" | "created_at" | "updated_at">
> {
  user_id: string;
  refresh_token: string;
  expires_at: Date;
}
