"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ROLES = [
  { value: "product_manager", label: "Product Manager" },
  { value: "analyst", label: "Аналитик" },
  { value: "marketer", label: "Маркетолог" },
  { value: "developer", label: "Разработчик" },
  { value: "founder", label: "Основатель" },
  { value: "other", label: "Другое" },
];

const COMPANY_SIZES = [
  { value: "1", label: "Только я" },
  { value: "2-10", label: "2–10" },
  { value: "11-50", label: "11–50" },
  { value: "51-200", label: "51–200" },
  { value: "200+", label: "200+" },
];

const USE_CASES = [
  { value: "app_reviews", label: "App Store / Google Play" },
  { value: "support_tickets", label: "Поддержка" },
  { value: "surveys", label: "Опросы" },
  { value: "social", label: "Соцсети" },
  { value: "other", label: "Другое" },
];

const SOURCES = [
  { value: "google", label: "Google" },
  { value: "colleague", label: "Коллега" },
  { value: "social", label: "Соцсети" },
  { value: "blog", label: "Блог / статья" },
  { value: "other", label: "Другое" },
];

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const { session } = useAuth();
  const [role, setRole] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [useCase, setUseCase] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!session?.user.id) return;
    setLoading(true);
    await supabase.from("onboarding_responses").insert({
      user_id: session.user.id,
      role: role || null,
      company_size: companySize || null,
      use_case: useCase || null,
      source: source || null,
    });
    setLoading(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Расскажите о себе</DialogTitle>
          <DialogDescription>
            Пара вопросов, чтобы мы лучше понимали наших пользователей. Все поля опциональны.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>Ваша роль</Label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  onClick={() => setRole(role === r.value ? "" : r.value)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    role === r.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Размер компании</Label>
            <div className="flex flex-wrap gap-2">
              {COMPANY_SIZES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setCompanySize(companySize === s.value ? "" : s.value)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    companySize === s.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Откуда берёте отзывы?</Label>
            <div className="flex flex-wrap gap-2">
              {USE_CASES.map(u => (
                <button
                  key={u.value}
                  onClick={() => setUseCase(useCase === u.value ? "" : u.value)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    useCase === u.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Как узнали о нас?</Label>
            <div className="flex flex-wrap gap-2">
              {SOURCES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSource(source === s.value ? "" : s.value)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    source === s.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? "Сохраняем..." : "Начать работу"}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Пропустить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
