import { Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary">
              <Activity className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="leading-none">
              <span className="text-sm font-black text-primary">FeedbackPulse</span>
              <span className="text-sm font-black text-foreground"> AI</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground hidden sm:block">
            Превращаем отзывы в инсайты с помощью искусственного интеллекта
          </p>

          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} FeedbackPulse AI
          </p>
        </div>
      </div>
    </footer>
  );
}
