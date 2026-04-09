"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Users, Shield, BarChart3, Download, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase, type Profile, type AuditLog, type OnboardingResponse } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

const PLAN_LIMITS: Record<string, number> = {
  free: 100,
  pro: 1000,
  enterprise: 999999,
};

export default function AdminPage() {
  const { session, profile: myProfile, loading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<Profile[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [onboarding, setOnboarding] = useState<OnboardingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [usersRes, logsRes, onboardingRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("audit_log").select("*, actor:profiles(email, full_name)").order("created_at", { ascending: false }).limit(200),
      supabase.from("onboarding_responses").select("role, company_size, use_case, source"),
    ]);
    setUsers(usersRes.data ?? []);
    setLogs(logsRes.data ?? []);
    setOnboarding(onboardingRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!session || myProfile?.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    loadData();
  }, [session, myProfile, authLoading, router, loadData]);

  async function changeRole(targetId: string, newRole: string) {
    const target = users.find(u => u.id === targetId);
    if (!target) return;

    if (newRole === "admin" && !confirm(`Назначить роль admin пользователю ${target.email}?`)) return;

    const adminCount = users.filter(u => u.role === "admin").length;
    if (target.role === "admin" && newRole !== "admin" && adminCount <= 1) {
      toast.error("Нельзя снять роль у последнего администратора");
      return;
    }

    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", targetId);
    if (error) { toast.error("Ошибка изменения роли"); return; }

    await fetch("/api/admin/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actor_id: session!.user.id,
        action: "role_change",
        target_id: targetId,
        payload: { old: target.role, new: newRole },
      }),
    });
    toast.success("Роль изменена");
    loadData();
    if (targetId === session?.user.id) refreshProfile();
  }

  async function changePlan(targetId: string, newPlan: string) {
    const { error } = await supabase
      .from("profiles")
      .update({ plan: newPlan, credits_limit: PLAN_LIMITS[newPlan] })
      .eq("id", targetId);
    if (error) { toast.error("Ошибка изменения тарифа"); return; }

    await fetch("/api/admin/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actor_id: session!.user.id,
        action: "plan_change",
        target_id: targetId,
        payload: { new: newPlan },
      }),
    });
    toast.success("Тариф изменён");
    loadData();
  }

  async function toggleBlock(target: Profile) {
    const newBlocked = !target.is_blocked;
    const { error } = await supabase.from("profiles").update({ is_blocked: newBlocked }).eq("id", target.id);
    if (error) { toast.error("Ошибка"); return; }

    await fetch("/api/admin/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actor_id: session!.user.id,
        action: newBlocked ? "block" : "unblock",
        target_id: target.id,
        payload: {},
      }),
    });
    toast.success(newBlocked ? "Пользователь заблокирован" : "Разблокирован");
    loadData();
  }

  async function resetCredits(targetId: string) {
    await supabase.from("profiles").update({ credits_used: 0 }).eq("id", targetId);
    toast.success("Credits сброшены");
    loadData();
  }

  function exportLogs() {
    const csv = [
      ["Дата", "Действие", "Администратор", "Цель", "Детали"].join(","),
      ...logs.map(l => [
        format(new Date(l.created_at), "dd.MM.yyyy HH:mm"),
        l.action,
        (l.actor as Profile)?.email ?? l.actor_id ?? "",
        l.target_id ?? "",
        JSON.stringify(l.payload),
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "audit-log.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function countBy(field: keyof OnboardingResponse) {
    const counts: Record<string, number> = {};
    onboarding.forEach(r => {
      const val = r[field] as string;
      if (val) counts[val] = (counts[val] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Shield className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground mt-0.5">Управление пользователями и мониторинг</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card><CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Всего пользователей</p>
          <p className="text-3xl font-bold">{users.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Заполнили онбординг</p>
          <p className="text-3xl font-bold">{onboarding.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Действий в журнале</p>
          <p className="text-3xl font-bold">{logs.length}</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" />Пользователи</TabsTrigger>
          <TabsTrigger value="audit"><Shield className="h-4 w-4 mr-1" />Журнал действий</TabsTrigger>
          <TabsTrigger value="onboarding"><BarChart3 className="h-4 w-4 mr-1" />Аналитика онбординга</TabsTrigger>
        </TabsList>

        {/* === ПОЛЬЗОВАТЕЛИ === */}
        <TabsContent value="users" className="mt-6">
          <div className="space-y-3">
            {users.map(user => (
              <Card key={user.id} className={user.is_blocked ? "border-destructive/30 bg-destructive/5" : ""}>
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{user.email}</p>
                        {user.is_blocked && (
                          <Badge variant="destructive" className="text-xs gap-1">
                            <AlertTriangle className="h-3 w-3" />Заблокирован
                          </Badge>
                        )}
                        {user.id === session?.user.id && (
                          <Badge variant="secondary" className="text-xs">Вы</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          Credits: {user.credits_used}/{user.credits_limit}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(user.created_at), "d MMM yyyy", { locale: ru })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Роль */}
                      <select
                        value={user.role}
                        onChange={e => changeRole(user.id, e.target.value)}
                        disabled={user.id === session?.user.id}
                        className="rounded border border-border bg-background px-2 py-1 text-xs"
                      >
                        <option value="viewer">viewer</option>
                        <option value="editor">editor</option>
                        <option value="admin">admin</option>
                      </select>
                      {/* Тариф */}
                      <select
                        value={user.plan}
                        onChange={e => changePlan(user.id, e.target.value)}
                        className="rounded border border-border bg-background px-2 py-1 text-xs"
                      >
                        <option value="free">free</option>
                        <option value="pro">pro</option>
                        <option value="enterprise">enterprise</option>
                      </select>
                      <Button size="sm" variant="ghost" onClick={() => resetCredits(user.id)} className="text-xs h-7">
                        Сброс credits
                      </Button>
                      <Button
                        size="sm"
                        variant={user.is_blocked ? "outline" : "destructive"}
                        onClick={() => toggleBlock(user)}
                        disabled={user.id === session?.user.id}
                        className="text-xs h-7"
                      >
                        {user.is_blocked ? "Разблокировать" : "Блокировать"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* === ЖУРНАЛ ДЕЙСТВИЙ === */}
        <TabsContent value="audit" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Журнал действий</CardTitle>
                  <CardDescription>Последние 200 административных действий</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={exportLogs}>
                  <Download className="h-4 w-4 mr-1" />Экспорт CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-auto">
                {logs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 rounded border p-3 text-sm">
                    <div className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.created_at), "dd.MM HH:mm")}
                    </div>
                    <div className="min-w-0">
                      <Badge variant="outline" className="text-xs mb-1">{log.action}</Badge>
                      <p className="text-xs text-muted-foreground">
                        Admin: {(log.actor as Profile)?.email ?? log.actor_id}
                      </p>
                      {log.payload && Object.keys(log.payload as object).length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {JSON.stringify(log.payload)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === ОНБОРДИНГ === */}
        <TabsContent value="onboarding" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { title: "Роли пользователей", data: countBy("role") },
              { title: "Размер компании", data: countBy("company_size") },
              { title: "Источник отзывов", data: countBy("use_case") },
              { title: "Источник трафика", data: countBy("source") },
            ].map(({ title, data }) => (
              <Card key={title}>
                <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
                <CardContent>
                  {data.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Нет данных</p>
                  ) : (
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical">
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Заполнили форму онбординга: <strong>{onboarding.length}</strong> из <strong>{users.length}</strong> ({users.length > 0 ? Math.round(onboarding.length / users.length * 100) : 0}%)
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
