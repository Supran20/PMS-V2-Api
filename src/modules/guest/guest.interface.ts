export interface GuestAttributes {
  id: string;

  full_name: string;
  designation?: string | null;
  slug: string;
  bio?: string | null;

  social_media?: Record<string, any> | null;
  email?: string | null;
  phone?: string | null;

  approved?: boolean;
  approved_by?: string | null;

  referred_by?: string | null;
  profile_image?: string | null;

  created_by?: string | null;
  updated_by?: string | null;

  created_at?: Date;
  updated_at?: Date;
}

export interface GuestCreationAttributes extends Partial<
  Omit<GuestAttributes, "id" | "slug" | "created_at" | "updated_at">
> {
  full_name: string;
  slug: string;
}
