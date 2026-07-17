import Guest from "../guest/guest.model";
import User from "../users/user.model";
import Interview from "../interview/interview.model";

export interface GuestReapprovalRequestAttributes {
  id: string;

  guest_id: string;
  requested_by: string;
  proposed_host_id?: string | null;
  interview_id?: string | null;

  trigger_source: "duplicate_guest_attempt" | "repeat_booking";
  status?: "pending" | "approved" | "rejected";

  reviewed_by?: string | null;
  reviewed_at?: Date | null;
  review_note?: string | null;

  created_by?: string | null;
  updated_by?: string | null;

  created_at?: Date;
  updated_at?: Date;

  // Associations
  guest?: Guest;
  requester?: User;
  proposedHost?: User;
  interview?: Interview;
  reviewer?: User;
  creator?: User;
  updater?: User;
}

export interface GuestReapprovalRequestCreationAttributes extends Partial<
  Omit<GuestReapprovalRequestAttributes, "id" | "created_at" | "updated_at">
> {
  guest_id: string;
  requested_by: string;
  trigger_source: "duplicate_guest_attempt" | "repeat_booking";
}
