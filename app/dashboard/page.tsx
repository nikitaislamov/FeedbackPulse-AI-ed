"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Upload, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/FileUploader";
import { ColumnMapper } from "@/components/ColumnMapper";
import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { AnalysisSkeleton } from "@/components/AnalysisSkeleton";
import { OnboardingModal } from "@/components/OnboardingModal";
import { parseFile, validateReviews, type ParsedData } from "@/lib/parsers";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { AnalysisResult } from "@/app/api/analyze/route";
import Link from "next/link";

type Step = "idle" | "upload" | "mapping" | "analyzing" | "results";

export default function DashboardPage() {
  const { session, profile } = useAuth();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("idle");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Восстановление анализа из истории
  useEffect(() => {
    if (searchParams.get("restore") === "1") {
      const saved = sessionStorage.getItem("restored_analysis");
      if (saved) {
        setAnalysisResult(JSON.parse(saved));
        setStep("results");
        sessionStorage.removeItem("restored_analysis");
      }
    }
  }, [searchParams]);

  // Показываем онбординг один раз после первого входа
  useEffect(() => {
    if (!session) return;
    supabase
      .from("onboarding_responses")
      .select("id")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setShowOnboarding(true);
      });
  }, [session]);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true);
    setCurrentFileName(file.name);
    try {
      const data = await parseFile(file);
      if (data.rows.length === 0) { toast.error("Файл пуст или не содержит данных"); return; }
      setParsedData(data);
      setStep("mapping");
      toast.success(`Загружено ${data.rows.length} строк`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при чтении файла");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleMapping = useCallback(
    async (textColumn: string, ratingColumn?: string) => {
      if (!parsedData) return;

      if (profile && profile.credits_used >= profile.credits_limit) {
        toast.error(`Исчерпан лимит анализов (${profile.credits_limit}). Обновите тариф.`);
        return;
      }

      setIsLoading(true);
      setStep("analyzing");

      try {
        const reviews = validateReviews(parsedData.rows, textColumn, ratingColumn);
        if (reviews.length === 0) {
          toast.error("Не найдено отзывов для анализа");
          setStep("mapping");
          setIsLoading(false);
          return;
        }

        toast.info(`Анализируем ${reviews.length} отзывов...`);

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviews }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Ошибка анализа");

        setAnalysisResult(data.result);
        setStep("results");
        toast.success("Анализ завершен!");

        if (session) {
          await saveAnalysis(session.user.id, data.result, reviews.length);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Произошла ошибка");
        setStep("mapping");
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parsedData, session, profile, currentFileName]
  );

  async function saveAnalysis(userId: string, result: AnalysisResult, reviewCount: number) {
    let projectId: string | undefined;

    const { data: existing } = await supabase
      .from("projects")
      .select("id")
      .eq("owner_id", userId)
      .eq("name", "Default")
      .maybeSingle();

    if (existing) {
      projectId = existing.id;
    } else {
      const { data: newProject } = await supabase
        .from("projects")
        .insert({ owner_id: userId, name: "Default" })
        .select("id")
        .single();
      projectId = newProject?.id;
    }

    if (!projectId) return;

    await supabase.from("analyses").insert({
      project_id: projectId,
      user_id: userId,
      file_name: currentFileName || null,
      review_count: reviewCount,
      status: "done",
      result_json: result,
      tokens_used: 0,
    });

    if (profile) {
      await supabase
        .from("profiles")
        .update({ credits_used: profile.credits_used + reviewCount })
        .eq("id", userId);
    }
  }

  const handleReset = useCallback(() => {
    setStep("idle");
    setParsedData(null);
    setAnalysisResult(null);
    setIsLoading(false);
    setCurrentFileName("");
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <OnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Аналитический дашборд</h1>
        <p className="text-muted-foreground mt-1">
          Загрузите файл с отзывами для анализа
          {profile && (
            <span className="ml-2 text-xs">
              · Credits: {profile.credits_used}/{profile.credits_limit}
            </span>
          )}
        </p>
      </div>

      {step === "idle" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
            onClick={() => setStep("upload")}
          >
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Новый анализ</CardTitle>
              <CardDescription>Загрузите файл CSV или Excel с отзывами для анализа</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Загрузить файл</Button>
            </CardContent>
          </Card>

          <Card className="transition-all hover:border-primary hover:shadow-md">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-4">
                <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>История анализов</CardTitle>
              <CardDescription>Просмотр предыдущих отчетов</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/history">Открыть историю</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {step === "upload" && (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={handleReset}>Назад</Button>
          </div>
          <FileUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
        </div>
      )}

      {step === "mapping" && parsedData && (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setStep("upload")}>Назад</Button>
          </div>
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">
              Найдено {parsedData.headers.length} колонок и {parsedData.rows.length} строк
            </p>
          </div>
          <ColumnMapper headers={parsedData.headers} onMapping={handleMapping} isLoading={isLoading} />
        </div>
      )}

      {step === "analyzing" && (
        <div className="max-w-4xl mx-auto">
          <AnalysisSkeleton />
        </div>
      )}

      {step === "results" && analysisResult && (
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" onClick={handleReset}>Новый анализ</Button>
          </div>
          <AnalysisDashboard data={analysisResult} />
        </div>
      )}
    </div>
  );
}
