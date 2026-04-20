/**
 * @screen: habits
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-2.jsx / screens-3.jsx
 * @queries: habits.listByUser withIndex("by_userId_deletedAt")
 * @mutations: habits.logCompletion, habits.softDelete
 * @routes-to: /habits/[id]
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import Link from "next/link";
import { useState } from "react";
import { mockHabitHeatmap14, mockHabits } from "@tempo/mock-data";
import { Button, HabitRing, Pill, Ring, SoftCard } from "@tempo/ui/primitives";
import { Plus } from "@tempo/ui/icons";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-4xl space-y-8 p-6 pb-24 md:p-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-eyebrow text-muted-foreground">Library · Habits</p>
            <h1 className="text-h1 font-serif text-foreground">Small repeats, big calm.</h1>
          </div>
          {/*
            @action createHabit
            @mutation: habits.create @index by_userId_deletedAt
            @auth: required
            @errors: toast
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button type="button" variant="primary" leadingIcon={<Plus size={14} />}>
            New habit
          </Button>
        </header>

        <SoftCard padding="md">
          <p className="mb-3 font-eyebrow text-muted-foreground">Last 14 days</p>
          <ul className="flex flex-wrap gap-1" aria-label="Habit heatmap last 14 days">
            {mockHabitHeatmap14.map((on, i) => (
              <li
                key={`h-${i}`}
                className={[
                  "h-4 w-4 list-none rounded-sm",
                  on ? "bg-[color:var(--color-moss)]" : "bg-surface-sunken",
                ].join(" ")}
              />
            ))}
          </ul>
        </SoftCard>

        <ul className="space-y-3">
          {mockHabits.map((h) => (
            <li key={h.id}>
              <SoftCard padding="md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <Link href={`/habits/${h.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                    <HabitRing completed={Math.min(7, h.recentCompletions.length)} total={7} />
                    <div className="min-w-0">
                      <h2 className="truncate font-serif text-lg text-foreground">{h.name}</h2>
                      <p className="text-caption text-muted-foreground">
                        {h.cadence} · streak {h.streak} · best {h.longestStreak ?? h.streak}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Ring size={36} stroke={3} value={Math.round((h.completionRatio ?? 0) * 100)} max={100} />
                    <Pill tone="moss">{h.streak}d</Pill>
                  </div>
                </div>
              </SoftCard>
            </li>
          ))}
        </ul>
      </div>
    </ScreenSurface>
  );
}
