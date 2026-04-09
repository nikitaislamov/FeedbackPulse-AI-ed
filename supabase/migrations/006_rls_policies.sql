-- Включаем RLS на всех таблицах
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log            ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

-- ===================== profiles =====================
CREATE POLICY "user_select_own_profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "admin_select_all_profiles" ON profiles
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "user_update_own_profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "admin_update_any_profile" ON profiles
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- ===================== projects =====================
CREATE POLICY "user_manage_own_projects" ON projects
  FOR ALL USING (owner_id = auth.uid());

-- ===================== analyses =====================
CREATE POLICY "user_select_own_analyses" ON analyses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "admin_select_all_analyses" ON analyses
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "user_insert_analysis" ON analyses
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    (SELECT credits_used FROM profiles WHERE id = auth.uid()) <
    (SELECT credits_limit FROM profiles WHERE id = auth.uid())
  );

-- ===================== audit_log =====================
CREATE POLICY "admin_select_audit_log" ON audit_log
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
-- INSERT только через service_role (серверный код)

-- ===================== onboarding_responses =====================
CREATE POLICY "user_select_own_onboarding" ON onboarding_responses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_insert_own_onboarding" ON onboarding_responses
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_select_all_onboarding" ON onboarding_responses
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
