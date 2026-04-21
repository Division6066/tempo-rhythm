"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, HabitRing, Pill, SoftCard } from "@tempo/ui/primitives";
import { mockHabits } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

/**
 * HabitsScreen — habit library with streaks + weekly ring.
 * @source docs/design/claude-export/design-system/screens-3.jsx (ScreenHabits)
 */
export function HabitsScreen() {
  const router = useRouter();
  const toast = useDemoToast();
  const [checks, setChecks] = useState<Record<string, boolean>>(
    Object.fromEntries(mockHabits.map((h) => [h.id, h.completedToday])),
  );

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Library"
        title="Habits"
        lede="Tiny structures that keep the rest from wobbling."
        right={
          <>
            {/*
             * @behavior: Add a new habit from the header CTA.
             * @convex-mutation-needed: habits.createHabit
             */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => toast("Created. (demo) habits.createHabit.")}
            >
              + New habit
            </Button>
          </>
        }
      />

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-2">
        {mockHabits.map((habit) => {
          const completedToday = checks[habit.id];
          return (
            <SoftCard key={habit.id} tone="default" padding="md">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <div className="font-eyebrow">{habit.frequencyLabel}</div>
                  {/*
                   * @behavior: Open habit detail to view check-in history + notes.
                   * @navigate: /habits/{habitId}
                   */}
                  <button
                    type="button"
                    className="text-left text-h4 font-serif hover:underline"
                    onClick={() => router.push(`/habits/${habit.id}`)}
                  >
                    {habit.title}
                  </button>
                  <div className="flex items-center gap-2">
                    <Pill tone="moss">{habit.streak}-day streak</Pill>
                    <span className="text-caption text-muted-foreground">
                      {habit.completionPercent}% this month
                    </span>
                  </div>
                </div>
                <HabitRing
                  completed={Math.round((habit.completionPercent / 100) * 7)}
                  total={7}
                  label="this week"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                    const filled = day < Math.round((habit.completionPercent / 100) * 7);
                    return (
                      <span
                        key={day}
                        className={[
                          "h-3 w-3 rounded-full",
                          filled ? "bg-primary" : "bg-surface-sunken",
                        ].join(" ")}
                        aria-hidden
                      />
                    );
                  })}
                </div>
                {/*
                 * @behavior: Toggle today's check-in for this habit.
                 * @convex-mutation-needed: habits.logCompletion
                 * @optimistic: flip locally, server reconciles
                 */}
                <Button
                  variant={completedToday ? "soft" : "primary"}
                  size="sm"
                  onClick={() => {
                    setChecks((prev) => ({ ...prev, [habit.id]: !completedToday }));
                    toast(
                      completedToday
                        ? "Cleared. (demo) habits.undoCompletion."
                        : "Checked in. (demo) habits.logCompletion.",
                    );
                  }}
                >
                  {completedToday ? "Checked today ✓" : "Check today"}
                </Button>
              </div>
            </SoftCard>
          );
        })}
      </div>
    </div>
  );
}
