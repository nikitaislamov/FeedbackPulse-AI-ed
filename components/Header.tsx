"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, LogOut, History, Shield, User, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { session, profile, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-sm shadow-primary/20">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div className="leading-none">
            <span className="text-base font-black text-primary tracking-tight">FeedbackPulse</span>
            <span className="block text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              AI Analytics
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
              >
                Дашборд
              </Link>
              <Link
                href="/history"
                className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
              >
                История
              </Link>
              <Link
                href="/dashboard"
                className="hidden md:inline-flex items-center gap-1.5 gradient-primary text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                Новый анализ
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 hover:bg-slate-100 rounded-lg"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <span className="hidden sm:inline max-w-[120px] truncate text-sm font-medium">
                      {profile?.full_name ?? session.user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-100 shadow-lg">
                  <div className="px-3 py-2 text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </div>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem asChild className="rounded-lg mx-1">
                    <Link href="/history">
                      <History className="mr-2 h-4 w-4" />
                      История анализов
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === "admin" && (
                    <DropdownMenuItem asChild className="rounded-lg mx-1">
                      <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive rounded-lg mx-1 focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
              >
                Главная
              </Link>
              <Link
                href="/login"
                className="gradient-primary text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-sm shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98] min-h-11 inline-flex items-center"
              >
                Войти
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
