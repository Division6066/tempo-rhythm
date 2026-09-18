import { Link, useRouterState } from "@/lib/tempo-graft/router";
import {
  CalendarDays,
  GraduationCap,
  Library,
  ListFilter,
  Map as MapIcon,
  Mic,
  NotebookPen,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Toaster } from "@/lib/tempo-graft/toast";
import { CommandPalette } from "@tempo-v0/components/tempo/command-palette";
import { BrandMark, Wordmark } from "@tempo-v0/components/tempo/brand";
import { DemoRail } from "@tempo-v0/components/tempo/demo-rail";
import { VoiceOverlay } from "@tempo-v0/components/tempo/voice-overlay";
import { UserButton } from "@/lib/tempo-graft/auth/gates";
import { useCurrentUserState } from "@/lib/tempo-graft/auth/use-current-user";
import { studioStore, useStudio } from "@tempo-v0/lib/tempo/studio";
import { useTempo } from "@tempo-v0/lib/tempo/use-tempo";
import { cn } from "@tempo-v0/lib/utils";

const NAV = [
  { to: "/today", label: "Today", icon: CalendarDays },
  { to: "/daily-note", label: "Daily", icon: NotebookPen },
  { to: "/notes", label: "Notes", icon: Library },
  { to: "/study", label: "Study", icon: GraduationCap },
  { to: "/map", label: "Map", icon: MapIcon },
  { to: "/review", label: "Review", icon: ListFilter },
] as const;

const MORE = [
  { to: "/coach", label: "Coach" },
  { to: "/templates", label: "Templates" },
  { to: "/brain-dump", label: "Brain dump" },
  { to: "/journal", label: "Journal" },
  { to: "/tasks", label: "Tasks" },
  { to: "/habits", label: "Habits" },
  { to: "/dashboard", label: "Pulse" },
  { to: "/memory", label: "Memory" },
  { to: "/settings", label: "Settings" },
] as const;

const WIDE = new Set(["/daily-note", "/map"]);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const fixtures = useSearchParams().get("fixtures") === "1";
  const { snapshot, setDemo } = useTempo();
  const { user, isPending } = useCurrentUserState();
  const studio = useStudio();
  const wide = WIDE.has(pathname);
  const focus = studio.focusMode;

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <div className={cn("mx-auto flex min-h-dvh", wide || focus ? "max-w-none" : "max-w-6xl")}>
        <aside className={cn("w-56 shrink-0 flex-col border-r border-border px-4 py-6", focus ? "hidden" : "hidden md:flex")}>
          <Link to="/" className="mb-8 flex items-center gap-3 px-2">
            <BrandMark size={28} />
            <Wordmark size="sm" />
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
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
            <p className="mt-5 px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">More</p>
            {MORE.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex h-10 items-center rounded-md px-3 text-sm",
                    active ? "text-accent" : "text-muted hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <p className="px-3 pt-6 text-xs leading-relaxed text-faint">Plain markdown. One page per day. Yours.</p>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <Link to="/daily-note" className="flex items-center gap-2 md:hidden">
              <BrandMark size={24} />
              <Wordmark size="sm" />
            </Link>
            <button
              type="button"
              className="hidden h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 text-xs text-muted md:inline-flex"
              onClick={() => {
                const ev = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
                window.dispatchEvent(ev);
              }}
            >
              Jump
              <kbd className="font-mono text-[10px] text-faint">⌘K</kbd>
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => studioStore.setFocusMode(!studio.focusMode)}
                className="hidden h-10 rounded-full border border-border bg-surface px-3 text-xs font-medium md:inline-flex"
              >
                {studio.focusMode ? "Show chrome" : "Focus"}
              </button>
              <button
                type="button"
                onClick={() => studioStore.setVoiceMode("walkie")}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-3 text-xs font-medium text-ink hover:bg-surface-2"
              >
                <Mic className="size-3.5" />
                Voice
              </button>
              {isPending ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-surface-2" />
              ) : user ? (
                <UserButton />
              ) : (
                <Link to="/login" className="text-sm text-muted hover:text-ink">
                  Sign in
                </Link>
              )}
            </div>
          </header>
          <main className={cn("flex-1", wide ? "flex min-h-0 flex-col pb-20 md:pb-0" : "px-4 py-6 pb-28 md:px-8 md:pb-8")}>
            {children}
          </main>
          {wide || !fixtures ? null : <DemoRail demo={snapshot.demo} onChange={setDemo} />}
        </div>
      </div>

      <nav className={cn("fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur md:hidden", focus && "hidden")}>
        <div className="grid grid-cols-6">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
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
      <CommandPalette />
      <VoiceOverlay />
      <Toaster position="bottom-right" richColors={false} />
    </div>
  );
}
