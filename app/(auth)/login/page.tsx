"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) toast.error(error.message);
  }

  return (
    <div className="bg-white rounded-3xl card-shadow-lg overflow-hidden border border-slate-100">
      <div className="p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black text-primary tracking-tight uppercase">
              FeedbackPulse AI
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-2">
            С возвращением
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Войдите, чтобы продолжить анализ отзывов
          </p>
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-foreground font-bold text-sm py-3 px-4 rounded-2xl transition-all shadow-sm active:scale-[0.98] mb-6"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Продолжить с Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">или</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <AuthField
            label="Email"
            icon={<Mail className="w-4 h-4" />}
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={setEmail}
          />
          <AuthField
            label="Пароль"
            icon={<Lock className="w-4 h-4" />}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
          />

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full mt-2 py-3.5 px-6 rounded-2xl font-extrabold text-sm tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2",
              loading
                ? "bg-slate-100 text-muted-foreground cursor-not-allowed"
                : "gradient-primary text-white shadow-lg shadow-primary/25 hover:opacity-90 hover:-translate-y-[1px]"
            )}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-500 animate-spin" />
                Вход...
              </>
            ) : (
              <>
                Войти
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Нет аккаунта?{" "}
          <Link
            href="/register"
            className="font-bold text-primary hover:text-primary-container transition-colors underline underline-offset-4"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}

function AuthField({
  label,
  icon,
  type,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 pl-11 pr-4 text-foreground placeholder:text-slate-400 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-medium text-sm outline-none"
        />
      </div>
    </div>
  );
}
