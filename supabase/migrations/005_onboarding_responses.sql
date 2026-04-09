CREATE TABLE onboarding_responses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role         TEXT,
  company_size TEXT,
  use_case     TEXT,
  source       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
