import { createClient } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "admin" | "editor" | "viewer";
  plan: "free" | "pro" | "enterprise";
  credits_used: number;
  credits_limit: number;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
};

export type Analysis = {
  id: string;
  project_id: string;
  user_id: string;
  file_name: string | null;
  review_count: number | null;
  status: "pending" | "processing" | "done" | "error";
  result_json: unknown;
  tokens_used: number;
  created_at: string;
};

export type AuditLog = {
  id: number;
  actor_id: string | null;
  action: string;
  target_id: string | null;
  payload: unknown;
  ip_address: string | null;
  created_at: string;
  actor?: Pick<Profile, "email" | "full_name">;
};

export type OnboardingResponse = {
  id: string;
  user_id: string;
  role: string | null;
  company_size: string | null;
  use_case: string | null;
  source: string | null;
  created_at: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
