import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { SYSTEM_PROMPT } from "@/lib/openai";

const reviewAnalysisSchema = z.object({
  summary: z.string().describe("Краткий общий вывод по всем отзывам"),
  stats: z.object({
    positive_percent: z.number().describe("Процент положительных отзывов"),
    neutral_percent: z.number().describe("Процент нейтральных отзывов"),
    negative_percent: z.number().describe("Процент негативных отзывов"),
    critical_count: z.number().describe("Количество критических проблем"),
  }),
  topics: z.array(
    z.object({
      name: z.string().describe("Название категории"),
      count: z.number().describe("Количество упоминаний"),
    })
  ),
  reviews: z.array(
    z.object({
      text: z.string().describe("Текст отзыва"),
      sentiment: z.enum(["Positive", "Neutral", "Negative"]),
      category: z.string().describe("Категория проблемы"),
      anomaly: z.boolean().describe("Есть ли аномалия между рейтингом и тональностью"),
    })
  ),
  action_plan: z.array(z.string()).describe("Список конкретных рекомендаций"),
});

export type AnalysisResult = z.infer<typeof reviewAnalysisSchema>;

export async function POST(req: Request) {
  try {
    const { reviews } = await req.json();

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return Response.json(
        { error: "Не предоставлены отзывы для анализа" },
        { status: 400 }
      );
    }

    // Формируем текст для анализа
    const reviewsText = reviews
      .map((r: { text: string; rating?: number }, i: number) => {
        const ratingInfo = r.rating ? ` [Рейтинг: ${r.rating}]` : "";
        return `${i + 1}. ${r.text}${ratingInfo}`;
      })
      .join("\n\n");

    const { output } = await generateText({
      model: google("gemini-1.5-flash"),
      output: Output.object({
        schema: reviewAnalysisSchema,
      }),
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Проанализируй следующие ${reviews.length} отзывов:\n\n${reviewsText}`,
        },
      ],
    });

    if (!output) {
      return Response.json(
        { error: "Не удалось получить результат анализа" },
        { status: 500 }
      );
    }

    return Response.json({ result: output });
  } catch (error) {
    console.error("Analysis error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
    
    return Response.json(
      { error: `Ошибка анализа: ${errorMessage}` },
      { status: 500 }
    );
  }
}
