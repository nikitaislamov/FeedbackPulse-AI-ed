CREATE TABLE audit_log (
  id         BIGSERIAL PRIMARY KEY,
  actor_id   UUID REFERENCES profiles(id),
  action     TEXT NOT NULL,  -- 'role_change' | 'plan_change' | 'block' | 'unblock' | 'delete'
  target_id  UUID,
  payload    JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
