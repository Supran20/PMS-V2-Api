export interface LogAttributes {
  id: string;

  event_type: string;
  recipient_email: string;
  status: "pending" | "sent" | "failed";

  error_message?: any | null;
  sent_at?: Date | null;

  created_by?: string | null;
  updated_by?: string | null;

  created_at?: Date;
  updated_at?: Date;
}

export interface LogCreationAttributes extends Partial<
  Omit<LogAttributes, "id">
> {
  event_type: string;
  recipient_email: string;
  status: "pending" | "sent" | "failed";
}
