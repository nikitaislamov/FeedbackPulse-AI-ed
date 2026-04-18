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
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
} from "recharts";
import type { AnalysisResult } from "@/lib/analysis-schema";
import { cn } from "@/lib/utils";

interface AnalysisDashboardProps {
  data: AnalysisResult;
}

const SENTIMENT_COLORS = {
  positive: "#10b981",
  neutral: "#94a3b8",
  negative: "#ef4444",
};

const TOPIC_COLORS = [
  "#630ed4",
  "#7c3aed",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#6a4fa0",
];

const SENTIMENT_LABELS = {
  positive: "Положительные",
  neutral: "Нейтральные",
  negative: "Отрицательные",
};

const TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "none",
  boxShadow: "0 10px 25px -5px rgba(11,28,48,0.1)",
  backgroundColor: "#ffffff",
  color: "#0b1c30",
  fontSize: "13px",
};

export function AnalysisDashboard({ data }: AnalysisDashboardProps) {
  const total = data.reviews.length;

  const positivePercent =
    total > 0 ? Math.round((data.sentimentDistribution.positive / total) * 100) : 0;
  const negativePercent =
    total > 0 ? Math.round((data.sentimentDistribution.negative / total) * 100) : 0;

  const sentimentData = useMemo(
    () => [
      {
        name: SENTIMENT_LABELS.positive,
        value: data.sentimentDistribution.positive,
        color: SENTIMENT_COLORS.positive,
      },
      {
        name: SENTIMENT_LABELS.neutral,
        value: data.sentimentDistribution.neutral,
        color: SENTIMENT_COLORS.neutral,
      },
      {
        name: SENTIMENT_LABELS.negative,
        value: data.sentimentDistribution.negative,
        color: SENTIMENT_COLORS.negative,
      },
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
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "negative":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <MinusCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="h-1 gradient-primary" />
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-bold text-foreground">Общее резюме</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Всего отзывов"
          value={String(total)}
          icon={<MessageSquare className="h-5 w-5" />}
          color="primary"
        />
        <MetricCard
          label="Положительных"
          value={`${positivePercent}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="success"
        />
        <MetricCard
          label="Негативных"
          value={`${negativePercent}%`}
          icon={<TrendingDown className="h-5 w-5" />}
          color="danger"
        />
        <MetricCard
          label="Критических"
          value={String(data.sentimentDistribution.negative)}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pie — 1 col */}
        <div className="bg-white rounded-2xl card-shadow p-6 flex flex-col">
          <h3 className="font-bold text-foreground mb-6">Тональность</h3>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value, "Отзывов"]}
                  contentStyle={TOOLTIP_STYLE}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-mono">{positivePercent}%</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                Позитив
              </span>
            </div>
          </div>
          <div className="space-y-2.5 mt-5">
            {sentimentData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-muted-foreground">{s.name}</span>
                </div>
                <span className="font-bold font-mono">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar — 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl card-shadow p-6">
          <h3 className="font-bold text-foreground mb-6">Категории отзывов</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicsData} layout="vertical" barSize={8}>
                <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={140}
                  axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [value, "Упоминаний"]}
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ fill: "rgba(99,14,212,0.04)" }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {topicsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Problems */}
      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="h-1 bg-red-500" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Топ проблем</h3>
                <p className="text-xs text-muted-foreground">Повторяющиеся проблемы с рекомендациями</p>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              Скачать отчёт
            </button>
          </div>

          <div className="space-y-4">
            {data.topProblems.map((problem, index) => (
              <div key={index} className="rounded-xl bg-slate-50 p-4 space-y-2 hover:bg-slate-100/70 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <p className="font-semibold text-sm">{problem.title}</p>
                  </div>
                  <Badge className="shrink-0 bg-red-50 text-red-600 border-none text-xs font-bold">
                    {Math.round(problem.affectedShare * 100)}% отзывов
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground pl-8">{problem.description}</p>
                <div className="pl-8 pt-1">
                  <div className="border-l-2 border-primary/30 pl-3">
                    <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">
                      Рекомендация
                    </p>
                    <p className="text-sm text-foreground">{problem.actionRecommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl card-shadow p-6">
        <h3 className="font-bold text-foreground mb-5">Все отзывы</h3>
        <div className="space-y-1 max-h-[400px] overflow-auto">
          {data.reviews.map((review) => (
            <div
              key={review.id}
              className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getSentimentIcon(review.sentiment)}
                <span className="text-sm text-muted-foreground font-mono">#{review.id + 1}</span>
                <span className="text-xs font-medium text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
                  {review.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">
                  {Math.round(review.confidence * 100)}%
                </span>
                <SentimentBadge sentiment={review.sentiment} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: "primary" | "success" | "danger" | "warning";
}) {
  const colorMap = {
    primary: {
      bar: "bg-primary",
      icon: "text-primary bg-primary/10",
    },
    success: {
      bar: "bg-emerald-500",
      icon: "text-emerald-600 bg-emerald-50",
    },
    danger: {
      bar: "bg-red-500",
      icon: "text-red-500 bg-red-50",
    },
    warning: {
      bar: "bg-amber-500",
      icon: "text-amber-600 bg-amber-50",
    },
  };

  return (
    <div className="bg-white rounded-xl card-shadow relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300">
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1 opacity-30 group-hover:opacity-100 transition-opacity",
          colorMap[color].bar
        )}
      />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-tight">
            {label}
          </p>
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-full shrink-0", colorMap[color].icon)}>
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold font-mono text-foreground">{value}</p>
      </div>
    </div>
  );
}

function SentimentBadge({ sentiment }: { sentiment: "positive" | "neutral" | "negative" }) {
  const map = {
    positive: "bg-emerald-50 text-emerald-700",
    neutral: "bg-slate-100 text-slate-600",
    negative: "bg-red-50 text-red-600",
  };
  return (
    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", map[sentiment])}>
      {SENTIMENT_LABELS[sentiment]}
    </span>
  );
}
