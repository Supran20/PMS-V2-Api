export interface ChannelAttributes {
  id: string;
  channel_name: string;
  slug: string;
  status: string; // active, suspended, trial, cancelled
  subscription_plan_id?: string | null;
  subscription_status?: string | null; // trialing, active, past_due, cancelled
  trial_ends_at?: Date | null;

  created_by?: string | null;
  updated_by?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface ChannelCreationAttributes extends Partial<
  Omit<ChannelAttributes, "id">
> {
  channel_name: string;
  slug: string;
  status: string;
}
