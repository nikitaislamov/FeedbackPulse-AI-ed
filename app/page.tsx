"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ArrowRight, Sparkles, Shield, Zap, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/FileUploader";
import { ColumnMapper } from "@/components/ColumnMapper";
import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { AnalysisSkeleton } from "@/components/AnalysisSkeleton";
import { parseFile, validateReviews, type ParsedData } from "@/lib/parsers";
import type { AnalysisResult } from "@/app/api/analyze/route";

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
        toast.success("Анализ завершен!");
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
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Hero Section — только на шаге upload */}
      {step === "upload" && (
        <section className="text-center mb-8 sm:mb-12 pt-2 sm:pt-6 lg:pt-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs sm:text-sm font-medium text-primary mb-6">
            <Sparkles className="h-4 w-4 shrink-0" />
            AI-powered анализ отзывов
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight leading-tight mb-4">
            Превращайте отзывы в{" "}
            <span className="text-primary">действенные инсайты</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mt-4 mb-8">
            FeedbackPulse AI анализирует ваши отзывы клиентов, определяет тональность,
            выявляет проблемы и формирует готовый план действий
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto mb-8 sm:mb-12">
            <Card className="border-muted">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start gap-3 sm:flex-col sm:items-center sm:text-center">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:mb-4">
                    <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 sm:mb-2">Быстрый анализ</h3>
                    <p className="text-sm text-muted-foreground">
                      Мгновенная обработка до 50 отзывов за один запрос
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-muted">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start gap-3 sm:flex-col sm:items-center sm:text-center">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:mb-4">
                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 sm:mb-2">Визуализация</h3>
                    <p className="text-sm text-muted-foreground">
                      Наглядные графики и диаграммы по результатам анализа
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-muted sm:col-span-2 lg:col-span-1">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start gap-3 sm:flex-col sm:items-center sm:text-center">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:mb-4">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 sm:mb-2">План действий</h3>
                    <p className="text-sm text-muted-foreground">
                      Конкретные рекомендации для улучшения продукта
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Progress Steps */}
      {step !== "upload" && (
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-1 sm:gap-4 mb-4 sm:mb-6 overflow-x-auto">
            <StepIndicator
              number={1}
              label="Загрузка"
              active={step === "upload"}
              completed={step !== "upload"}
            />
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
            <StepIndicator
              number={2}
              label="Маппинг"
              active={step === "mapping"}
              completed={step === "analyzing" || step === "results"}
            />
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
            <StepIndicator
              number={3}
              label="Анализ"
              active={step === "analyzing"}
              completed={step === "results"}
            />
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
            <StepIndicator
              number={4}
              label="Результаты"
              active={step === "results"}
              completed={false}
            />
          </div>
          <div className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={handleReset} className="min-h-11">
              Начать заново
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {step === "upload" && (
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-center mb-4">
              Загрузите файл с отзывами
            </h2>
            <FileUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
          </div>
        )}

        {step === "mapping" && parsedData && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">Настройте маппинг колонок</h2>
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

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div
        className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-colors ${
          active
            ? "bg-primary text-primary-foreground"
            : completed
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
        }`}
      >
        {number}
      </div>
      <span
        className={`hidden sm:block text-sm font-medium ${
          active ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
