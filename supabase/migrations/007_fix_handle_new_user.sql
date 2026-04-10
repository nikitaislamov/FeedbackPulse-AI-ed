-- Пересоздаём функцию с SET search_path = public (обязательно для SECURITY DEFINER в Supabase)
-- и обрабатываем NULL email (бывает при некоторых OAuth-провайдерах)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Разрешаем INSERT в profiles через триггер (service_role и SECURITY DEFINER функции)
-- Без этой политики RLS блокирует вставку даже из триггера
CREATE POLICY "service_role_insert_profiles" ON profiles
  FOR INSERT WITH CHECK (true);
