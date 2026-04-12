"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Download,
  CheckCircle,
  XCircle,
  MinusCircle,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import type { AnalysisResult } from "@/lib/analysis-schema";

interface AnalysisDashboardProps {
  data: AnalysisResult;
}

const SENTIMENT_COLORS = {
  positive: "#22c55e",
  neutral: "#eab308",
  negative: "#ef4444",
};

const TOPIC_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#14b8a6",
  "#6366f1",
];

const SENTIMENT_LABELS = {
  positive: "Позитивные",
  neutral: "Нейтральные",
  negative: "Негативные",
};

export function AnalysisDashboard({ data }: AnalysisDashboardProps) {
  const total = data.reviews.length;

  const positivePercent = total > 0 ? Math.round((data.sentimentDistribution.positive / total) * 100) : 0;
  const negativePercent = total > 0 ? Math.round((data.sentimentDistribution.negative / total) * 100) : 0;

  const sentimentData = useMemo(
    () => [
      { name: SENTIMENT_LABELS.positive, value: data.sentimentDistribution.positive, color: SENTIMENT_COLORS.positive },
      { name: SENTIMENT_LABELS.neutral, value: data.sentimentDistribution.neutral, color: SENTIMENT_COLORS.neutral },
      { name: SENTIMENT_LABELS.negative, value: data.sentimentDistribution.negative, color: SENTIMENT_COLORS.negative },
    ],
    [data.sentimentDistribution]
  );

  const topicsData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of data.reviews) {
      counts[r.category] = (counts[r.category] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], index) => ({
        name,
        count,
        fill: TOPIC_COLORS[index % TOPIC_COLORS.length],
      }));
  }, [data.reviews]);

  const handleExport = () => {
    const report = `
ОТЧЕТ АНАЛИЗА ОТЗЫВОВ
=====================
Дата: ${new Date().toLocaleDateString("ru-RU")}

КРАТКОЕ РЕЗЮМЕ
--------------
${data.summary}

СТАТИСТИКА
----------
- Всего отзывов: ${total}
- Положительных: ${data.sentimentDistribution.positive} (${positivePercent}%)
- Нейтральных: ${data.sentimentDistribution.neutral}
- Негативных: ${data.sentimentDistribution.negative} (${negativePercent}%)

РАСПРЕДЕЛЕНИЕ ПО КАТЕГОРИЯМ
----------------------------
${topicsData.map((t) => `- ${t.name}: ${t.count} упоминаний`).join("\n")}

ТОП ПРОБЛЕМЫ И РЕКОМЕНДАЦИИ
----------------------------
${data.topProblems
  .map(
    (p, i) =>
      `${i + 1}. ${p.title} (затронуто ${Math.round(p.affectedShare * 100)}% отзывов)\n   ${p.description}\n   Рекомендация: ${p.actionRecommendation}`
  )
  .join("\n\n")}
    `.trim();

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-report-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSentimentIcon = (sentiment: "positive" | "neutral" | "negative") => {
    switch (sentiment) {
      case "positive":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "negative":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <MinusCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Общее резюме
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{data.summary}</p>
        </CardContent>
      </Card>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего отзывов</p>
                <p className="text-3xl font-bold">{total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Позитивных</p>
                <p className="text-3xl font-bold text-green-500">{positivePercent}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Негативных</p>
                <p className="text-3xl font-bold text-red-500">{negativePercent}%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Критических</p>
                <p className="text-3xl font-bold text-amber-500">
                  {data.sentimentDistribution.negative}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Распределение тональности</CardTitle>
            <CardDescription>Соотношение позитивных, нейтральных и негативных отзывов</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, "Отзывов"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Категории отзывов</CardTitle>
            <CardDescription>Количество упоминаний по категориям</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicsData} layout="vertical">
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => [value, "Упоминаний"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Problems */}
      <Card className="border-red-500/20 bg-red-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Топ проблем
              </CardTitle>
              <CardDescription>Повторяющиеся проблемы с рекомендациями</CardDescription>
            </div>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Скачать отчёт
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topProblems.map((problem, index) => (
              <div key={index} className="rounded-lg border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <p className="font-medium">{problem.title}</p>
                  </div>
                  <Badge variant="destructive" className="shrink-0">
                    {Math.round(problem.affectedShare * 100)}% отзывов
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground pl-8">{problem.description}</p>
                <div className="pl-8 pt-1 border-l-2 border-blue-500/40 ml-3">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    <span className="font-medium">Рекомендация:</span> {problem.actionRecommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Все отзывы</CardTitle>
          <CardDescription>Классификация каждого отзыва по тональности и категории</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-auto">
            {data.reviews.map((review) => (
              <div
                key={review.id}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {getSentimentIcon(review.sentiment)}
                  <span className="text-sm text-muted-foreground">#{review.id + 1}</span>
                  <Badge variant="outline">{review.category}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    уверенность {Math.round(review.confidence * 100)}%
                  </span>
                  <Badge
                    variant="secondary"
                    className={
                      review.sentiment === "positive"
                        ? "text-green-600"
                        : review.sentiment === "negative"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }
                  >
                    {SENTIMENT_LABELS[review.sentiment]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
