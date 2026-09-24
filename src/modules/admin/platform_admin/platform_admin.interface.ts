export interface PlatformAdminAttributes {
  id: string;
  user_id: string;

  created_by?: string | null;
  updated_by?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface PlatformAdminCreationAttributes
  extends Partial<Omit<PlatformAdminAttributes, "id">> {
  user_id: string;
}