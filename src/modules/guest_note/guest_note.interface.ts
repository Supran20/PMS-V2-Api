export interface GuestNoteAttributes {
  id: string;

  guest_id: string;

  title: string;
  description?: string | null;

  created_by?: string | null;
  updated_by?: string | null;

  created_at?: Date;
  updated_at?: Date;
}

export interface GuestNoteCreationAttributes extends Omit<
  GuestNoteAttributes,
  "id" | "created_at" | "updated_at"
> {}
