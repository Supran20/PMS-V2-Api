export interface IMedia {
  id: string;
  media_name: string | null;
  path: string | null;
  type: string | null;

  tag_id: string | null; // FK to Tags

  created_at: Date;
  updated_at: Date;

  created_by: string | null; // FK to Users
  updated_by: string | null; // FK to Users
}
