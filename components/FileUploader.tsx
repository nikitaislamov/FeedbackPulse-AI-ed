"use client";

import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function FileUploader({ onFileSelect, isLoading }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const validTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    const validExtensions = [".csv", ".xlsx", ".xls"];

    const hasValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );
    const hasValidType = validTypes.includes(file.type) || file.type === "";

    if (!hasValidExtension || !hasValidType) {
      setError("Пожалуйста, загрузите файл в формате CSV или Excel (.xlsx, .xls)");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Размер файла не должен превышать 10 МБ");
      return false;
    }

    return true;
  };

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="space-y-2">
          <Alert variant="destructive" className="rounded-xl border-red-100 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <button
            onClick={() => setError(null)}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {!selectedFile ? (
        <div className="bg-white rounded-2xl card-shadow p-6 sm:p-8">
          <div className="relative group cursor-pointer">
            {/* Ambient hover glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary-container/5 rounded-xl scale-[0.98] group-hover:scale-100 transition-transform duration-300 ease-out" />

            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInput}
              disabled={isLoading}
            />
            <label
              htmlFor="file-upload"
              className={cn(
                "relative flex flex-col items-center justify-center min-h-44 sm:min-h-52 cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 px-6 py-8 text-center",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 hover:border-primary/50 bg-slate-50/50"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {/* Icon */}
              <div
                className={cn(
                  "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5 shadow-sm transition-transform duration-300",
                  isDragging ? "bg-primary/10 scale-110" : "bg-white group-hover:scale-110"
                )}
              >
                <Upload className="w-7 h-7 text-primary" />
              </div>

              {/* Text */}
              <p className="text-base font-semibold text-foreground mb-1">
                <span className="sm:hidden">Нажмите, чтобы выбрать файл</span>
                <span className="hidden sm:inline">Перетащите выгрузку отзывов сюда</span>
              </p>
              <p className="text-sm text-muted-foreground">
                CSV или Excel, до 10 МБ, до 50 строк за раз
              </p>

              {/* Divider */}
              <div className="hidden sm:flex items-center gap-3 my-4 w-full max-w-xs">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">или</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Secondary CTA */}
              <span className="hidden sm:inline-flex text-sm font-bold text-primary bg-white border border-slate-200 px-5 py-2 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                Выбрать на компьютере
              </span>
            </label>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl card-shadow p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate text-sm">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              disabled={isLoading}
              aria-label="Удалить файл"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
