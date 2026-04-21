"use client";

import { Pill, Ring, SoftCard } from "@tempo/ui/primitives";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";

/**
 * InsightsScreen — user analytics dashboard.
 * @source docs/design/claude-export/design-system/screens-5.jsx (ScreenInsights)
 */
export function InsightsScreen() {
  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="You"
        title="Insights"
        lede="Patterns over time. Nothing here to beat yourself up about."
      />

      <div className="grid gap-5 px-6 py-6 md:grid-cols-3">
        <SoftCard tone="default" padding="md">
          <div className="font-eyebrow">This week</div>
          <div className="mt-1 font-serif text-h2">17 tasks</div>
          <p className="text-caption text-muted-foreground">
            completed · 22% more than last week
          </p>
          {/*
           * @behavior: Reactive chart of completions by day.
           * @convex-query-needed: analytics.tasksCompletedByDay
           */}
        </SoftCard>
        <SoftCard tone="default" padding="md">
          <div className="font-eyebrow">Focus time</div>
          <div className="mt-1 font-serif text-h2">4h 12m</div>
          <p className="text-caption text-muted-foreground">
            tracked this week · mornings lead by 2:1
          </p>
          {/*
           * @convex-query-needed: analytics.focusTimeByWeek
           */}
        </SoftCard>
        <SoftCard tone="default" padding="md">
          <div className="font-eyebrow">Habit adherence</div>
          <div className="mt-1 flex items-center gap-3">
            <Ring size={56} value={82} max={100}>
              <span className="font-tabular">82</span>
            </Ring>
            <p className="text-caption text-muted-foreground">
              three habits at ≥80% this month
            </p>
          </div>
          {/*
           * @convex-query-needed: analytics.habitAdherenceThisMonth
           */}
        </SoftCard>
      </div>

      <div className="grid gap-5 px-6 pb-8 md:grid-cols-2">
        <SoftCard tone="default" padding="md">
          <div className="font-eyebrow">Energy by hour</div>
          <div className="mt-3 flex h-32 items-end gap-1">
            {Array.from({ length: 24 }, (_, i) => {
              const h = 0.25 + 0.7 * Math.sin((i / 24) * Math.PI - 0.5);
              return (
                <span
                  key={i}
                  className="tempo-gradient-bg flex-1 rounded-t"
                  style={{ height: `${Math.max(8, h * 100)}%` }}
                  aria-hidden
                />
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between text-caption text-muted-foreground">
            <span>00:00</span>
            <span>noon</span>
            <span>24:00</span>
          </div>
          {/*
           * @behavior: 24-hour energy histogram based on self-reports.
           * @convex-query-needed: analytics.energyHistogram
           */}
        </SoftCard>
        <SoftCard tone="default" padding="md">
          <div className="font-eyebrow">Flag</div>
          <div className="mt-2 flex flex-col gap-2">
            <Pill tone="moss">Morning pages streak: 12 days</Pill>
            <Pill tone="amber">You logged anxious 3 days in a row</Pill>
            <Pill tone="slate">High-energy hours are 09:30–11:00</Pill>
          </div>
          <p className="mt-3 text-small text-muted-foreground">
            No ranks, no streaks that reset. Data is yours to export or delete
            any time.
          </p>
        </SoftCard>
      </div>
    </div>
  );
}
