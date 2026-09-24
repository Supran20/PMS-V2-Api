export interface SubscriptionPlanAttributes {
  id: string;
  plan_name: string;
  description?: string | null;
  max_users?: number | null;
  max_interviews_per_month?: number | null;
  storage_limit_mb?: number | null;
  price: number;
  billing_interval: string; // monthly, yearly
  is_active: boolean;

  created_by?: string | null;
  updated_by?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface SubscriptionPlanCreationAttributes extends Partial<
  Omit<SubscriptionPlanAttributes, "id">
> {
  plan_name: string;
  price: number;
  billing_interval: string;
}
