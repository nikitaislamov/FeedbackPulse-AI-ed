import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { actor_id, action, target_id, payload } = body;

    if (!actor_id || !action) {
      return Response.json({ error: "actor_id и action обязательны" }, { status: 400 });
    }

    // Проверяем, что инициатор является администратором
    const { data: actor } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", actor_id)
      .single();

    if (actor?.role !== "admin") {
      return Response.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null;

    await supabaseAdmin.from("audit_log").insert({
      actor_id,
      action,
      target_id: target_id ?? null,
      payload: payload ?? {},
      ip_address: ip,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Audit log error:", error);
    return Response.json({ error: "Внутренняя ошибка" }, { status: 500 });
  }
}
