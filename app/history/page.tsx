"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { FileText, Eye, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase, type Analysis } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/app/api/analyze/route";

const STATUS_CONFIG = {
  done: { label: "Готово", icon: CheckCircle, color: "text-green-500" },
  error: { label: "Ошибка", icon: XCircle, color: "text-red-500" },
  processing: { label: "Обработка", icon: Loader2, color: "text-yellow-500" },
  pending: { label: "Ожидание", icon: Clock, color: "text-muted-foreground" },
};

export default function HistoryPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      setLoading(false);
      return;
    }

    supabase
      .from("analyses")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setAnalyses(data ?? []);
        setLoading(false);
      });
  }, [session, authLoading]);

  function openAnalysis(analysis: Analysis) {
    if (analysis.result_json) {
      sessionStorage.setItem("restored_analysis", JSON.stringify(analysis.result_json));
      router.push("/dashboard?restore=1");
    }
  }

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">История анализов</h1>
        <p className="text-muted-foreground mt-1">Все ваши предыдущие отчёты</p>
      </div>

      {analyses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Ни одного анализа не выполнялось</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {session
                ? "Загрузите файл с отзывами, чтобы начать"
                : "Войдите в аккаунт и загрузите файл с отзывами, чтобы начать"}
            </p>
            <Button onClick={() => router.push(session ? "/dashboard" : "/login")}>
              {session ? "Новый анализ" : "Войти"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {analyses.map((analysis) => {
            const status = STATUS_CONFIG[analysis.status];
            const Icon = status.icon;
            return (
              <Card key={analysis.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{analysis.file_name ?? "Без названия"}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(analysis.created_at), "d MMM yyyy, HH:mm", { locale: ru })}
                        </span>
                        {analysis.review_count && (
                          <span className="text-xs text-muted-foreground">
                            {analysis.review_count} отзывов
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`gap-1 ${status.color}`}>
                      <Icon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                    {analysis.status === "done" && analysis.result_json && (
                      <Button size="sm" variant="outline" onClick={() => openAnalysis(analysis)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Открыть
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
