import { createClient } from "@supabase/supabase-js";

// Используется ТОЛЬКО в серверном коде (API routes)
// НИКОГДА не импортировать в клиентские компоненты
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
