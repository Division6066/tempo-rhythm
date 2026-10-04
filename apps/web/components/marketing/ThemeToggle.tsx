"use client";

import { Moon, Sun } from "@tempo/ui/icons";
import { useTheme } from "@/components/providers/ThemeProvider";

/**
 * Landing-page theme control. Uses the app theme store so it stays in
 * step with the rest of Tempo Flow.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground"
    >
      {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
