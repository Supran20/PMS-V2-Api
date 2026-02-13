export interface StudioAttributes {
  id: string;
  studio_name: string;
  address?: string | null;
  slug: string;

  created_by?: string | null;
  updated_by?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface StudioCreationAttributes extends Partial<
  Omit<StudioAttributes, "id">
> {
  studio_name: string;
}
