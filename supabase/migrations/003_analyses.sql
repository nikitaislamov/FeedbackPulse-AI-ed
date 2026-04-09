CREATE TABLE analyses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name    TEXT,
  review_count INTEGER,
  status       TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'processing' | 'done' | 'error'
  result_json  JSONB,
  tokens_used  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
