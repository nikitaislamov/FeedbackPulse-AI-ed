# FeedbackPulse AI

SaaS-сервис для AI-анализа клиентских отзывов. Автоматически определяет тональность, категоризирует темы, выявляет топ-проблемы и формирует actionable-рекомендации.

## Возможности

- **Импорт данных** — Drag-and-drop загрузка CSV и Excel файлов (до 10MB)
- **Умный маппинг** — Автоматическое определение колонок с текстом отзывов и рейтингом
- **AI-анализ** — Определение тональности (positive/negative/neutral), категоризация по 7 темам, уровень уверенности
- **Топ проблем** — Автоматическое выявление повторяющихся проблем с конкретными рекомендациями
- **Визуализация** — Интерактивные графики: круговая диаграмма тональности, столбчатая диаграмма категорий
- **Экспорт** — Выгрузка полного отчёта в текстовый файл

## Технологии

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **UI**: shadcn/ui, Recharts
- **AI**: Vercel AI SDK 6, Google Gemini 2.5 Flash (`gemini-2.5-flash`)
- **Парсинг**: PapaParse (CSV), SheetJS (Excel)
- **БД/Авторизация**: Supabase (PostgreSQL, Auth)

## Установка

```bash
# Клонирование репозитория
git clone <repository-url>
cd feedbackpulse-ai

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env.local
# Заполните переменные в .env.local

# Запуск dev-сервера
npm run dev
```

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | API ключ Google Gemini — получить на [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL вашего Supabase проекта |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Публичный anon-ключ Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Серверный service_role ключ Supabase |

## Структура проекта

```
├── app/
│   ├── api/analyze/      # API роут для AI-анализа (Gemini 2.5 Flash)
│   ├── dashboard/        # Страница дашборда
│   ├── history/          # История анализов
│   ├── admin/            # Панель администратора
│   └── page.tsx          # Главная страница
├── components/
│   ├── AnalysisDashboard.tsx  # Дашборд с графиками
│   ├── AnalysisSkeleton.tsx   # Скелетон загрузки
│   ├── ColumnMapper.tsx       # Маппинг колонок
│   ├── FileUploader.tsx       # Загрузка файлов
│   ├── Header.tsx             # Шапка сайта
│   └── OnboardingModal.tsx    # Онбординг новых пользователей
├── lib/
│   ├── analysis-schema.ts # Zod-схема результата анализа
│   ├── llm.ts             # Конфигурация AI-модели
│   └── parsers.ts         # Парсеры CSV/Excel
├── context/
│   └── AuthContext.tsx    # Глобальное состояние авторизации
└── supabase/migrations/   # SQL-миграции базы данных
```

## Использование

1. Войдите в аккаунт или зарегистрируйтесь
2. Загрузите файл с отзывами (CSV или Excel, до 50 строк на анализ)
3. Проверьте автоматический маппинг колонок или настройте вручную
4. Нажмите «Запустить анализ»
5. Изучите результаты: тональность, категории, топ проблем
6. Экспортируйте отчёт при необходимости

## Лицензия

MIT.
