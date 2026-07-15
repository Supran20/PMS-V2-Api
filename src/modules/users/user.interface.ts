export interface UserAttributes {
  id: string;
  full_name: string;
  email: string;
  password: string;

  status?: string | null;
  email_verify_at?: Date | null;
  otp?: string | null;
  otp_expires_at?: Date | null;
  remember_token?: string | null;
  remember_token_expires_at?: Date | null;
  remember_until: Date | null;

  profile_image?: string | null;
  mobile_number?: string | null;

  enable_otp_login?: boolean;
  otp_in_sms?: boolean;
  otp_in_mail?: boolean;

  visibility_mode?: "default" | "range" | "all";

  visibility_start_date?: Date | null;
  visibility_end_date?: Date | null;

  created_at?: Date;
  updated_at?: Date;
}

export interface UserCreationAttributes extends Partial<
  Omit<UserAttributes, "id" | "created_at" | "updated_at">
> {
  full_name: string;
  email: string;
  password: string;
}
