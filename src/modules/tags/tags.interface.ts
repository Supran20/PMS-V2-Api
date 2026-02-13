export interface ITag {
  id: string;
  tag_name: string;
  slug: string;

  created_at: Date;
  updated_at: Date;

  created_by?: string | null; // FK to Users
  updated_by?: string | null; // FK to Users
}
