import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Проверяем роль только для /admin — всё остальное доступно,
  // клиентские страницы сами управляют редиректами через AuthContext
  if (pathname.startsWith("/admin")) {
    try {
      const authCookie = Array.from(req.cookies.getAll()).find(
        (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
      );

      if (!authCookie) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Cookie: req.cookies.toString() } } }
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return NextResponse.redirect(new URL("/login", req.url));

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
