"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ArrowRight, Check } from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import { ColumnMapper } from "@/components/ColumnMapper";
import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { AnalysisSkeleton } from "@/components/AnalysisSkeleton";
import { parseFile, validateReviews, type ParsedData } from "@/lib/parsers";
import type { AnalysisResult } from "@/app/api/analyze/route";
import { cn } from "@/lib/utils";

type Step = "upload" | "mapping" | "analyzing" | "results";

export default function HomePage() {
  const [step, setStep] = useState<Step>("upload");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const data = await parseFile(file);

      if (data.rows.length === 0) {
        toast.error("Файл пуст или не содержит данных");
        return;
      }

      setParsedData(data);
      setStep("mapping");
      toast.success(`Загружено ${data.rows.length} строк`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка при чтении файла";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleMapping = useCallback(
    async (textColumn: string, ratingColumn?: string) => {
      if (!parsedData) return;

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

        if (!response.ok) {
          throw new Error(data.error || "Ошибка анализа");
        }

        setAnalysisResult(data.result);
        setStep("results");
        toast.success("Анализ завершён!");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Произошла ошибка";
        toast.error(message);
        setStep("mapping");
      } finally {
        setIsLoading(false);
      }
    },
    [parsedData]
  );

  const handleReset = useCallback(() => {
    setStep("upload");
    setParsedData(null);
    setAnalysisResult(null);
    setIsLoading(false);
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* ── Hero (только на upload) ── */}
      {step === "upload" && (
        <section className="text-center mb-10 sm:mb-14 pt-2 sm:pt-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-widest mb-6">
            AI-powered аналитика отзывов
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-foreground mb-4 max-w-3xl mx-auto">
            Поймите, что бесит ваших клиентов —{" "}
            <span className="text-primary">за минуту, а не за день</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Загрузите выгрузку отзывов — получите темы, тональность и список того,
            что чинить в первую очередь.
          </p>

          {/* Upload zone */}
          <div className="max-w-2xl mx-auto">
            <FileUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
          </div>
        </section>
      )}

      {/* ── Progress Steps (не на upload) ── */}
      {step !== "upload" && (
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 overflow-x-auto">
            <StepIndicator number={1} label="Загрузка" completed={step !== "upload"} />
            <StepArrow />
            <StepIndicator
              number={2}
              label="Маппинг"
              active={step === "mapping"}
              completed={step === "analyzing" || step === "results"}
            />
            <StepArrow />
            <StepIndicator
              number={3}
              label="Анализ"
              active={step === "analyzing"}
              completed={step === "results"}
            />
            <StepArrow />
            <StepIndicator
              number={4}
              label="Результаты"
              active={step === "results"}
            />
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleReset}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-white"
            >
              ← Начать заново
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="max-w-4xl mx-auto">
        {step === "mapping" && parsedData && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Настройте маппинг колонок</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Найдено {parsedData.headers.length} колонок и {parsedData.rows.length} строк
              </p>
            </div>
            <ColumnMapper
              headers={parsedData.headers}
              onMapping={handleMapping}
              isLoading={isLoading}
            />
          </div>
        )}

        {step === "analyzing" && <AnalysisSkeleton />}

        {step === "results" && analysisResult && (
          <AnalysisDashboard data={analysisResult} />
        )}
      </div>
    </div>
  );
}

function StepArrow() {
  return (
    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
  );
}

function StepIndicator({
  number,
  label,
  active = false,
  completed = false,
}: {
  number: number;
  label: string;
  active?: boolean;
  completed?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all",
          active
            ? "gradient-primary text-white shadow-sm shadow-primary/30"
            : completed
            ? "bg-primary/15 text-primary"
            : "bg-slate-100 text-muted-foreground"
        )}
      >
        {completed ? <Check className="h-3.5 w-3.5" /> : number}
      </div>
      <span
        className={cn(
          "hidden sm:block text-sm font-medium",
          active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}
