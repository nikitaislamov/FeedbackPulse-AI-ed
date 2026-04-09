import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PUBLIC_PATHS = ["/", "/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("sb-access-token")?.value ??
    req.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0]}-auth-token`)?.value;

  // Читаем сессию из cookies суpabase (формат: sb-<project>-auth-token)
  const authCookie = Array.from(req.cookies.getAll())
    .find(c => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

  if (!authCookie && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Для /admin делаем проверку роли через Supabase
  if (pathname.startsWith("/admin")) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Cookie: req.cookies.toString() } } }
      );

      const { data: { user } } = await supabase.auth.getUser();
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
  matcher: ["/dashboard/:path*", "/history/:path*", "/admin/:path*"],
};
