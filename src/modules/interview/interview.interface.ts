import { InterviewStatus } from "../../constants/interviewStatus";

export interface InterviewAttributes {
  id: string;

  guest_id: string;
  host_id: string;
  studio_id: string;

  interview_date?: string | null; // YYYY-MM-DD
  start_time?: string | null; // HH:mm:ss
  end_time?: string | null; // HH:mm:ss

  interview_status?: string | null; // scheduled, completed, cancelled
  live_status?: string | null; // live, recorded, not_live

  status?: InterviewStatus;

  priority?: number;

  google_drive_link?: string | null;
  youtube_link?: string | null;
  youtube_title?: string | null;

  created_by?: string | null;
  updated_by?: string | null;

  created_at?: Date;
  updated_at?: Date;
}

export interface InterviewCreationAttributes extends Partial<
  Omit<InterviewAttributes, "id">
> {
  guest_id: string;
  studio_id: string;
  host_id?: string;
}
