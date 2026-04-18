"use client";

import { useState } from "react";
import { MessageSquare, Star, ChevronDown, Check, ArrowRight, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ColumnMapperProps {
  headers: string[];
  onMapping: (textColumn: string, ratingColumn?: string) => void;
  isLoading?: boolean;
}

export function ColumnMapper({ headers, onMapping, isLoading }: ColumnMapperProps) {
  const [textColumn, setTextColumn] = useState<string>("");
  const [ratingColumn, setRatingColumn] = useState<string>("");
  const [textOpen, setTextOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);

  const handleSubmit = () => {
    if (textColumn) {
      onMapping(textColumn, ratingColumn || undefined);
    }
  };

  const suggestedTextColumn = headers.find((h) =>
    /review|text|comment|отзыв|текст|комментарий|feedback|message/i.test(h)
  );
  const suggestedRatingColumn = headers.find((h) =>
    /rating|score|rate|рейтинг|оценка|stars/i.test(h)
  );

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      {/* Gradient top bar */}
      <div className="h-1 w-full gradient-primary" />

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <Database className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Сопоставление колонок</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Укажите, в каких колонках находятся данные для анализа
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Text column */}
          <MapperRow
            label="Текст отзыва"
            hint="Обязательно"
            icon={<MessageSquare className="h-4 w-4" />}
            required
            value={textColumn}
            suggested={suggestedTextColumn}
            headers={headers}
            open={textOpen}
            onToggle={() => setTextOpen(!textOpen)}
            onSelect={(h) => { setTextColumn(h); setTextOpen(false); }}
            disabled={isLoading}
          />

          {/* Rating column */}
          <MapperRow
            label="Оценка (Рейтинг)"
            hint="Опционально"
            icon={<Star className="h-4 w-4 text-amber-500" />}
            value={ratingColumn}
            suggested={suggestedRatingColumn}
            headers={headers}
            open={ratingOpen}
            onToggle={() => setRatingOpen(!ratingOpen)}
            onSelect={(h) => { setRatingColumn(h); setRatingOpen(false); }}
            onClear={() => { setRatingColumn(""); setRatingOpen(false); }}
            disabled={isLoading}
          />
        </div>

        {/* Submit */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!textColumn || isLoading}
            className={cn(
              "inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98]",
              textColumn && !isLoading
                ? "gradient-primary text-white shadow-lg shadow-primary/20 hover:opacity-90"
                : "bg-slate-100 text-muted-foreground cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Анализируем отзывы...
              </>
            ) : (
              <>
                Начать анализ
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MapperRow({
  label,
  hint,
  icon,
  required,
  value,
  suggested,
  headers,
  open,
  onToggle,
  onSelect,
  onClear,
  disabled,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  required?: boolean;
  value: string;
  suggested?: string;
  headers: string[];
  open: boolean;
  onToggle: () => void;
  onSelect: (h: string) => void;
  onClear?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100/60 transition-colors">
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <span className="text-sm font-semibold text-foreground">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </span>
          <span className="block text-xs text-muted-foreground mt-0.5">{hint}</span>
        </div>
        {suggested && !value && (
          <Badge variant="secondary" className="text-[10px] font-bold hidden sm:inline-flex">
            Найдено: {suggested}
          </Badge>
        )}
      </div>

      {/* Custom dropdown */}
      <div className="relative w-full md:w-64">
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className={cn(
            "w-full flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm transition-all",
            "hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            value ? "text-foreground font-medium" : "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="truncate">{value || "Выберите колонку..."}</span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground ml-2 shrink-0 transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute z-20 mt-1 w-full bg-white rounded-xl border border-slate-100 shadow-lg overflow-hidden">
            <div className="max-h-48 overflow-auto py-1">
              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-slate-50 transition-colors"
                >
                  Не использовать
                </button>
              )}
              {headers.map((header) => (
                <button
                  key={header}
                  type="button"
                  onClick={() => onSelect(header)}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-primary/5 transition-colors"
                >
                  <span className="truncate">{header}</span>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {suggested === header && value !== header && (
                      <Badge variant="outline" className="text-[10px] font-bold">Найдено</Badge>
                    )}
                    {value === header && <Check className="h-4 w-4 text-primary" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
