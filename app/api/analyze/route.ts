import { generateObject } from "ai";
import { llm } from "@/lib/llm";
import { AnalysisResultSchema, type AnalysisResult } from "@/lib/analysis-schema";

export { type AnalysisResult };

export const maxDuration = 60;

const SYSTEM_PROMPT = `Ты — senior-аналитик клиентского опыта с 10-летним опытом работы
с потребительской обратной связью. Твоя задача — анализировать отзывы
пользователей и превращать их в actionable-инсайты для продуктовой команды.

Принципы работы:
1. ТОЧНОСТЬ КЛАССИФИКАЦИИ. Каждый отзыв получает РОВНО одну тональность
   и ОДНУ основную категорию — ту, что доминирует в тексте. Если отзыв
   смешанный — выбирай по главному болевому пункту.
2. ДИСТАНЦИЯ ОТ РЕЙТИНГА. Если передан rating, используй его только как
   слабый сигнал. Опирайся на текст: отзыв на 5 звёзд может содержать
   критику, и наоборот.
3. ГРУППИРОВКА ПРОБЛЕМ. Топ-проблемы — это НЕ три самых громких отзыва.
   Это три темы, которые повторяются у РАЗНЫХ пользователей.
4. КОНКРЕТИКА В РЕКОМЕНДАЦИЯХ. Вместо "улучшить UX" пиши
   "Переработать экран онбординга: 18% пользователей не понимают,
   куда вводить промокод". Формат: действие + причина с цифрой.
5. ЧЕСТНОСТЬ. Если данных мало или они противоречивы — снижай confidence.
   Не придумывай проблемы, которых нет.
6. ЯЗЫК. Отвечай на русском, в деловом нейтральном тоне. Без штампов
   ("революционный", "невероятный").

Категории (используй только эти):
- "Цена" — жалобы/похвала по стоимости, скидкам, тарифам
- "Качество товара" — физические дефекты, несоответствие описанию
- "Доставка" — сроки, упаковка, курьеры
- "Юзабилити/UX" — непонятный интерфейс, навигация, формы
- "Поддержка" — работа службы клиентского сервиса
- "Техническая ошибка" — баги, краши, ошибки приложения
- "Другое" — всё, что не подходит выше

Тональности:
- "positive" — пользователь доволен, даже если есть мелкие замечания
- "negative" — основной посыл негативный, есть жалоба
- "neutral" — констатация факта, вопрос, без эмоциональной окраски`;

function buildUserPrompt(reviews: { id: number; text: string; rating?: number }[]): string {
  const reviewsBlock = reviews
    .map((r) => {
      const ratingPart = r.rating != null ? ` (rating=${r.rating})` : "";
      return `[id=${r.id}]${ratingPart} "${r.text}"`;
    })
    .join("\n");

  return `Проанализируй следующие отзывы клиентов. Всего отзывов: ${reviews.length}.

Для каждого отзыва верни:
- id
- sentiment (одна из 3 меток)
- category (одна из 7 категорий)
- confidence (0..1)

Затем сделай агрегированный анализ:
- summary: общий вывод по всей выборке, 3-5 предложений
- topProblems: до 3 главных проблем (только из отзывов с sentiment=negative), для каждой укажи долю затронутых отзывов и конкретную рекомендацию
- sentimentDistribution: количество отзывов каждой тональности

Отзывы:
${reviewsBlock}`;
}

function sanitize(result: AnalysisResult, totalCount: number): AnalysisResult {
  // 1. Пересчитываем sentimentDistribution по массиву reviews — не доверяем арифметике модели
  const dist = { positive: 0, neutral: 0, negative: 0 };
  for (const r of result.reviews) {
    dist[r.sentiment]++;
  }

  // 2. Нормализуем affectedShare: если модель вернула проценты (>1) — делим на 100
  const topProblems = result.topProblems.map((p) => ({
    ...p,
    affectedShare: p.affectedShare > 1 ? p.affectedShare / 100 : p.affectedShare,
  }));

  // 3. Убираем дубликаты topProblems по нормализованному title
  const seen = new Set<string>();
  const uniqueProblems = topProblems.filter((p) => {
    const key = p.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    ...result,
    sentimentDistribution: dist,
    topProblems: uniqueProblems,
  };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Некорректный JSON в теле запроса" }, { status: 400 });
  }

  const { reviews } = body as { reviews?: unknown[] };

  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return Response.json({ error: "Передайте непустой массив reviews" }, { status: 400 });
  }

  if (reviews.length > 50) {
    return Response.json(
      { error: `Превышен лимит: максимум 50 отзывов за один запрос, получено ${reviews.length}` },
      { status: 413 }
    );
  }

  // Присваиваем id и обрезаем текст до 2000 символов
  const prepared = reviews.map((r: unknown, i: number) => {
    const review = r as { text?: string; rating?: number; date?: string };
    return {
      id: i,
      text: (review.text ?? "").slice(0, 2000),
      ...(review.rating != null ? { rating: review.rating } : {}),
      ...(review.date != null ? { date: review.date } : {}),
    };
  });

  try {
    const { object } = await generateObject({
      model: llm,
      schema: AnalysisResultSchema,
      system: SYSTEM_PROMPT,
      prompt: buildUserPrompt(prepared),
      temperature: 0.3,
    });

    const result = sanitize(object, prepared.length);

    return Response.json({ result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[analyze] error:", msg);

    if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
      return Response.json(
        { error: "Превышен лимит запросов к AI. Подождите немного и попробуйте снова." },
        { status: 429 }
      );
    }

    return Response.json({ error: "Ошибка при выполнении анализа. Попробуйте ещё раз." }, { status: 500 });
  }
}
