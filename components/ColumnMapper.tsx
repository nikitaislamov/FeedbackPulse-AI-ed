"use client";

import { useState } from "react";
import { MessageSquare, Star, ChevronDown, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface ColumnMapperProps {
  headers: string[];
  onMapping: (textColumn: string, ratingColumn?: string) => void;
  isLoading?: boolean;
}

export function ColumnMapper({ headers, onMapping, isLoading }: ColumnMapperProps) {
  const [textColumn, setTextColumn] = useState<string>("");
  const [ratingColumn, setRatingColumn] = useState<string>("");

  const handleSubmit = () => {
    if (textColumn) {
      onMapping(textColumn, ratingColumn || undefined);
    }
  };

  // Автоматическое определение колонок
  const suggestedTextColumn = headers.find((h) =>
    /review|text|comment|отзыв|текст|комментарий|feedback|message/i.test(h)
  );
  const suggestedRatingColumn = headers.find((h) =>
    /rating|score|rate|рейтинг|оценка|stars/i.test(h)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Настройка маппинга колонок
        </CardTitle>
        <CardDescription>
          Укажите, какая колонка содержит текст отзывов, и опционально — колонку с рейтингом
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Колонка с текстом отзыва <span className="text-destructive">*</span>
            </label>
            {suggestedTextColumn && !textColumn && (
              <Badge variant="secondary" className="text-xs">
                Рекомендуется: {suggestedTextColumn}
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
                disabled={isLoading}
              >
                {textColumn || "Выберите колонку"}
                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full max-h-60 overflow-auto">
              {headers.map((header) => (
                <DropdownMenuItem
                  key={header}
                  onClick={() => setTextColumn(header)}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{header}</span>
                  {textColumn === header && <Check className="h-4 w-4 text-primary" />}
                  {suggestedTextColumn === header && textColumn !== header && (
                    <Badge variant="outline" className="text-xs ml-2">
                      Рекомендуется
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Колонка с рейтингом (опционально)
            </label>
            {suggestedRatingColumn && !ratingColumn && (
              <Badge variant="secondary" className="text-xs">
                Найдено: {suggestedRatingColumn}
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
                disabled={isLoading}
              >
                {ratingColumn || "Не выбрано"}
                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full max-h-60 overflow-auto">
              <DropdownMenuItem onClick={() => setRatingColumn("")}>
                Не использовать
              </DropdownMenuItem>
              {headers.map((header) => (
                <DropdownMenuItem
                  key={header}
                  onClick={() => setRatingColumn(header)}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{header}</span>
                  {ratingColumn === header && <Check className="h-4 w-4 text-primary" />}
                  {suggestedRatingColumn === header && ratingColumn !== header && (
                    <Badge variant="outline" className="text-xs ml-2">
                      Найдено
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <p className="text-xs text-muted-foreground">
            Если указан рейтинг, система проверит соответствие тональности отзыва оценке
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!textColumn || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">◌</span>
              Анализируем отзывы...
            </>
          ) : (
            "Начать анализ"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
