export interface InterviewAttributes {
  id: string;

  guest_id: string;
  host_id: string;
  studio_id: string;

  interview_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss

  interview_status?: string | null; // scheduled, completed, cancelled
  live_status?: string | null; // live, recorded, not_live

  google_drive_link?: string | null;
  youtube_link?: string | null;

  created_by?: string | null;
  updated_by?: string | null;

  created_at?: Date;
  updated_at?: Date;
}

export interface InterviewCreationAttributes extends Partial<
  Omit<InterviewAttributes, "id">
> {
  guest_id: string;
  host_id: string;
  studio_id: string;
  interview_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm:ss
}
