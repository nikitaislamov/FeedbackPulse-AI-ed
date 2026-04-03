export const SYSTEM_PROMPT = `Ты — профессиональный аналитик данных. Проанализируй предоставленные отзывы. Для каждого отзыва определи:
1. Sentiment (Positive, Neutral, Negative).
2. Category (Цена, Техническая ошибка, Интерфейс, Качество обслуживания, Доставка, Качество продукта).

Сформируй итоговый JSON:
{
  "summary": "краткий текст с общим выводом",
  "stats": {
    "positive_percent": число от 0 до 100,
    "neutral_percent": число от 0 до 100,
    "negative_percent": число от 0 до 100,
    "critical_count": число критических проблем
  },
  "topics": [
    { "name": "категория", "count": число }
  ],
  "reviews": [
    { "text": "текст отзыва", "sentiment": "Positive|Neutral|Negative", "category": "категория", "anomaly": false }
  ],
  "action_plan": ["задача 1", "задача 2", "задача 3"]
}

ВАЖНО: 
- Ответ должен содержать ТОЛЬКО валидный JSON без markdown-разметки.
- Если рейтинг отзыва (1-2) не соответствует положительной тональности, отметь anomaly: true.
- action_plan должен содержать конкретные и действенные рекомендации.`;

export interface AnalysisResult {
  summary: string;
  stats: {
    positive_percent: number;
    neutral_percent: number;
    negative_percent: number;
    critical_count: number;
  };
  topics: { name: string; count: number }[];
  reviews: {
    text: string;
    sentiment: "Positive" | "Neutral" | "Negative";
    category: string;
    anomaly: boolean;
  }[];
  action_plan: string[];
}

export function validateAnalysisResult(data: unknown): AnalysisResult {
  if (!data || typeof data !== "object") {
    throw new Error("Некорректный формат ответа AI");
  }
  
  const result = data as Record<string, unknown>;
  
  if (typeof result.summary !== "string") {
    throw new Error("Отсутствует или некорректное поле summary");
  }
  
  if (!result.stats || typeof result.stats !== "object") {
    throw new Error("Отсутствует или некорректное поле stats");
  }
  
  if (!Array.isArray(result.topics)) {
    throw new Error("Отсутствует или некорректное поле topics");
  }
  
  if (!Array.isArray(result.action_plan)) {
    throw new Error("Отсутствует или некорректное поле action_plan");
  }
  
  return data as AnalysisResult;
}
