import { z } from "zod";

const SENTIMENTS = ["positive", "neutral", "negative"] as const;

const CATEGORIES = [
  "Цена",
  "Качество товара",
  "Доставка",
  "Юзабилити/UX",
  "Поддержка",
  "Техническая ошибка",
  "Другое",
] as const;

const ReviewAnalysis = z.object({
  id: z.number().int(),
  sentiment: z.enum(SENTIMENTS),
  category: z.enum(CATEGORIES),
  confidence: z.number().min(0).max(1),
});

const TopProblem = z.object({
  title: z.string(),
  description: z.string(),
  // Model sometimes returns 0–100 instead of 0–1; sanitize() normalizes it after validation
  affectedShare: z.number().min(0),
  actionRecommendation: z.string(),
});

export const AnalysisResultSchema = z.object({
  reviews: z.array(ReviewAnalysis),
  summary: z.string(),
  topProblems: z.array(TopProblem).max(3),
  sentimentDistribution: z.object({
    positive: z.number().int().min(0),
    neutral: z.number().int().min(0),
    negative: z.number().int().min(0),
  }),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
