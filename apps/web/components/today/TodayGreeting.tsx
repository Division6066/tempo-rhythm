"use client";

import { cn } from "@/lib/utils";

type TodayGreetingProps = {
  greetingName: string | undefined;
};

export function TodayGreeting({ greetingName }: TodayGreetingProps) {
  const safeName = greetingName?.trim() || "there";

  return (
    <header className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">היום</p>
      <h1
        aria-live="polite"
        className={cn(
          "font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl",
        )}
      >
        שלום, <span className="text-gradient-primary">{safeName}</span>
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground">
        מסך אחד רגוע להתחיל ממנו. משימה אחת קטנה עכשיו מספיקה.
      </p>
    </header>
  );
}
