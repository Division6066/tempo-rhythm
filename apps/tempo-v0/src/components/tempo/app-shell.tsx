import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, CircleGauge, HeartPulse, Library, ListChecks, Sparkles } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { DemoRail } from "@/components/tempo/demo-rail";
import { mockStore } from "@/lib/tempo/mock";
import { useTempo } from "@/lib/tempo/use-tempo";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Today", icon: CalendarDays },
  { to: "/dashboard", label: "Pulse", icon: CircleGauge },
  { to: "/memory", label: "Memory", icon: Library },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/habits", label: "Habits", icon: HeartPulse },
  { to: "/coach", label: "Coach", icon: Sparkles },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { snapshot, setDemo } = useTempo();

  useEffect(() => {
    mockStore.hydrateFromStorage();
  }, []);

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <div className="mx-auto flex min-h-dvh max-w-6xl">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-border px-4 py-6 md:flex">
          <Link to="/" className="mb-8 flex items-center gap-3 px-2">
            <MetronomeMark />
            <span className="font-display text-xl font-medium tracking-tight">Tempo</span>
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium",
                    active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2 hover:text-ink",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <p className="px-3 pt-6 text-xs leading-relaxed text-faint">
            Remembers what you committed to. Surfaces what you keep avoiding.
          </p>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
            <Link to="/" className="flex items-center gap-2">
              <MetronomeMark />
              <span className="font-display text-lg font-medium">Tempo</span>
            </Link>
          </header>
          <main className="flex-1 px-4 py-6 pb-28 md:px-8 md:pb-8">{children}</main>
          <DemoRail demo={snapshot.demo} onChange={setDemo} />
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-6">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-medium",
                  active ? "text-accent" : "text-faint",
                )}
              >
                <Icon className="size-5" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <Toaster position="bottom-right" richColors={false} />
    </div>
  );
}

function MetronomeMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx="8" className="fill-accent" />
      <path d="M14 6l6 16H8L14 6z" className="fill-accent-fg" fillOpacity="0.92" />
      <path d="M14 10v8" className="stroke-accent" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
