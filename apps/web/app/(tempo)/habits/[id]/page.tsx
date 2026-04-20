/**
 * @screen: habit-detail
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-2.jsx / screens-3.jsx
 * @queries: habits.getById withIndex("by_userId_deletedAt")
 * @mutations: habits.logCompletion @index by_userId_deletedAt
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { mockHabitDetailGrid42, mockHabits } from "@tempo/mock-data";
import { Button, HabitRing, Pill, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [mode, setMode] = useState<ViewMode>("ready");

  const habit = useMemo(() => mockHabits.find((h) => h.id === id) ?? null, [id]);

  if (!habit) {
    return (
      <ScreenSurface mode={mode} onModeChange={setMode}>
        <div className="p-8">
          <SoftCard padding="md">
            <p className="text-muted-foreground">Habit not found.</p>
            <Link href="/habits" className="mt-4 inline-block text-primary underline">
              Back to habits
            </Link>
          </SoftCard>
        </div>
      </ScreenSurface>
    );
  }

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-3xl space-y-8 p-6 pb-24 md:p-8">
        <Link href="/habits" className="text-small text-muted-foreground hover:text-foreground">
          ← Habits
        </Link>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-h1 font-serif text-foreground">{habit.name}</h1>
            <p className="mt-1 text-body text-muted-foreground">
              {habit.cadence} · current streak {habit.streak} · longest {habit.longestStreak}
            </p>
          </div>
          <HabitRing completed={Math.min(7, habit.recentCompletions.length)} total={7} />
        </header>

        <div className="flex flex-wrap gap-2">
          {/*
            @action logHabitToday
            @mutation: habits.logCompletion @index by_userId_deletedAt
            @optimistic: ring tick
            @auth: required
            @errors: toast
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button type="button" variant="primary">
            Log today
          </Button>
          {/*
            @action skipHabitToday
            @mutation: habits.logSkip (Long Run 2)
            @auth: required
            @errors: toast
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button type="button" variant="ghost">
            Skip
          </Button>
        </div>

        <SoftCard padding="md">
          <p className="mb-3 font-eyebrow text-muted-foreground">6-week grid</p>
          <div className="grid grid-cols-7 gap-1" role="img" aria-label="Habit completion heatmap, decorative">
            {mockHabitDetailGrid42.map((on, i) => (
              <div
                key={`c-${i}`}
                className={[
                  "aspect-square rounded-sm",
                  on ? "bg-[color:var(--color-moss)]" : "bg-surface-sunken",
                ].join(" ")}
              />
            ))}
          </div>
        </SoftCard>

        <SoftCard tone="sunken" padding="md">
          <p className="text-small text-muted-foreground">
            Coach can nudge without shame — toggles respect your quiet days.
          </p>
          <Pill tone="orange" className="mt-2">
            Coach-aware
          </Pill>
        </SoftCard>
      </div>
    </ScreenSurface>
  );
}
