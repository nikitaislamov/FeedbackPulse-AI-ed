"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MessageSquare,
  Download,
  CheckCircle,
  XCircle,
  MinusCircle,
  Lightbulb,
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
import type { AnalysisResult } from "@/app/api/analyze/route";

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

export function AnalysisDashboard({ data }: AnalysisDashboardProps) {
  const sentimentData = useMemo(
    () => [
      { name: "Позитивные", value: data.stats.positive_percent, color: SENTIMENT_COLORS.positive },
      { name: "Нейтральные", value: data.stats.neutral_percent, color: SENTIMENT_COLORS.neutral },
      { name: "Негативные", value: data.stats.negative_percent, color: SENTIMENT_COLORS.negative },
    ],
    [data.stats]
  );

  const topicsData = useMemo(
    () =>
      data.topics.map((topic, index) => ({
        name: topic.name,
        count: topic.count,
        fill: TOPIC_COLORS[index % TOPIC_COLORS.length],
      })),
    [data.topics]
  );

  const anomalies = useMemo(
    () => data.reviews.filter((r) => r.anomaly),
    [data.reviews]
  );

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
- Положительных отзывов: ${data.stats.positive_percent}%
- Нейтральных отзывов: ${data.stats.neutral_percent}%
- Негативных отзывов: ${data.stats.negative_percent}%
- Критических проблем: ${data.stats.critical_count}

РАСПРЕДЕЛЕНИЕ ПО ТЕМАМ
----------------------
${data.topics.map((t) => `- ${t.name}: ${t.count} упоминаний`).join("\n")}

ПЛАН ДЕЙСТВИЙ
-------------
${data.action_plan.map((action, i) => `${i + 1}. ${action}`).join("\n")}

${
  anomalies.length > 0
    ? `
ОБНАРУЖЕННЫЕ АНОМАЛИИ
---------------------
${anomalies.map((a) => `- "${a.text.slice(0, 100)}..." (${a.sentiment}, ${a.category})`).join("\n")}
`
    : ""
}
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

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Negative":
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

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего отзывов</p>
                <p className="text-3xl font-bold">{data.reviews.length}</p>
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
                <p className="text-3xl font-bold text-green-500">
                  {data.stats.positive_percent}%
                </p>
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
                <p className="text-3xl font-bold text-red-500">
                  {data.stats.negative_percent}%
                </p>
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
                  {data.stats.critical_count}
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
            <CardDescription>
              Соотношение позитивных, нейтральных и негативных отзывов
            </CardDescription>
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
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Доля"]}
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
            <CardTitle>Темы отзывов</CardTitle>
            <CardDescription>
              Количество упоминаний по категориям
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicsData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
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

      {/* Action Plan */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-500" />
                План действий
              </CardTitle>
              <CardDescription>
                Рекомендации на основе анализа отзывов
              </CardDescription>
            </div>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Скачать отчет
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.action_plan.map((action, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border bg-card p-4"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                  {index + 1}
                </div>
                <p className="text-sm">{action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Обнаруженные аномалии
            </CardTitle>
            <CardDescription>
              Отзывы, где тональность не соответствует рейтингу
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {anomalies.map((review, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-amber-500/30 bg-card p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    {getSentimentIcon(review.sentiment)}
                    <Badge variant="outline">{review.category}</Badge>
                    <Badge variant="secondary">{review.sentiment}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {review.text.length > 200
                      ? review.text.slice(0, 200) + "..."
                      : review.text}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Все отзывы</CardTitle>
          <CardDescription>
            Детальный список проанализированных отзывов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[500px] overflow-auto">
            {data.reviews.map((review, index) => (
              <div
                key={index}
                className={`rounded-lg border p-4 ${
                  review.anomaly ? "border-amber-500/30 bg-amber-500/5" : "bg-card"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  {getSentimentIcon(review.sentiment)}
                  <Badge variant="outline">{review.category}</Badge>
                  {review.anomaly && (
                    <Badge variant="destructive" className="text-xs">
                      Аномалия
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{review.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
