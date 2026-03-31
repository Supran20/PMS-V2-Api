import User from "../users/user.model";
import Media from "../media/media.model";
import GuestNote from "../guest_note/guest_note.model";

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

  status?: "not_started" | "contacted" | "follow_up" | "confirmed";
  record?: boolean;
  rejected?: boolean;

  referred_by?: string | null;
  profile_image?: string | null;
  tags?: string[] | null;
  tag_ids?: string[] | null;

  host_id?: string | null;

  created_by?: string | null;
  updated_by?: string | null;

  created_at?: Date;
  updated_at?: Date;

  // Add association types
  referrer?: User;
  host?: User;
  approver?: User;
  creator?: User;
  updater?: User;
  profileImage?: Media;
  notes?: GuestNote[];
}

export interface GuestCreationAttributes extends Partial<
  Omit<GuestAttributes, "id" | "slug" | "created_at" | "updated_at">
> {
  full_name: string;
  rejected?: boolean;
}
