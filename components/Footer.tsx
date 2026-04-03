import { Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">
              FeedbackPulse<span className="text-primary"> AI</span>
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Превращаем отзывы в инсайты с помощью искусственного интеллекта
          </p>
          
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FeedbackPulse AI. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
