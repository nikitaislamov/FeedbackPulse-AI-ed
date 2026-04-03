"use client";

import { Activity } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            FeedbackPulse<span className="text-primary"> AI</span>
          </span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link 
            href="/" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Главная
          </Link>
          <Link 
            href="/dashboard" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Дашборд
          </Link>
        </nav>
      </div>
    </header>
  );
}
