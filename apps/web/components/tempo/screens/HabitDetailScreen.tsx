"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, HabitRing, Pill, SoftCard } from "@tempo/ui/primitives";
import { mockHabits } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

type Props = { habitId: string };

/**
 * HabitDetailScreen — single habit deep-dive.
 * @source docs/design/claude-export/design-system/screens-3.jsx (ScreenHabitDetail)
 */
export function HabitDetailScreen({ habitId }: Props) {
  const router = useRouter();
  const toast = useDemoToast();
  const habit = useMemo(
    () => mockHabits.find((h) => h.id === habitId) ?? mockHabits[0],
    [habitId],
  );
  const [checkedToday, setCheckedToday] = useState(habit.completedToday);

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow={habit.frequencyLabel}
        title={habit.title}
        lede={`${habit.streak}-day streak · ${habit.completionPercent}% this month`}
        right={
          <Button variant="ghost" size="sm" onClick={() => router.push("/habits")}>
            ← Habits
          </Button>
        }
      />

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SoftCard tone="default" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-eyebrow">Today</div>
              <h3 className="mt-1 font-serif text-h4">
                {checkedToday ? "Checked in" : "Not yet"}
              </h3>
            </div>
            <HabitRing
              completed={Math.round((habit.completionPercent / 100) * 7)}
              total={7}
              label="this week"
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            {/*
             * @behavior: Toggle today's completion; counts toward streak.
             * @convex-mutation-needed: habits.logCompletion
             * @optimistic: flip locally first
             */}
            <Button
              variant={checkedToday ? "soft" : "primary"}
              size="md"
              onClick={() => {
                setCheckedToday((c) => !c);
                toast(
                  checkedToday
                    ? "Cleared. (demo) habits.undoCompletion."
                    : "Checked. (demo) habits.logCompletion.",
                );
              }}
            >
              {checkedToday ? "✓ Checked today" : "Check today"}
            </Button>
            {/*
             * @behavior: Snooze habit reminder for today only.
             * @convex-mutation-needed: habits.snoozeToday
             */}
            <Button
              variant="ghost"
              size="md"
              onClick={() => toast("Snoozed. (demo) habits.snoozeToday.")}
            >
              Snooze today
            </Button>
          </div>

          <div className="mt-6">
            <div className="font-eyebrow mb-2">Last 28 days</div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 28 }, (_, i) => {
                const intensity =
                  (habit.completionPercent / 100) * (1 - (i % 5) * 0.15);
                return (
                  <span
                    key={i}
                    className={[
                      "h-6 rounded",
                      intensity > 0.8
                        ? "bg-primary"
                        : intensity > 0.5
                          ? "bg-primary/60"
                          : intensity > 0.2
                            ? "bg-primary/30"
                            : "bg-surface-sunken",
                    ].join(" ")}
                    aria-hidden
                  />
                );
              })}
            </div>
          </div>
        </SoftCard>

        <div className="flex flex-col gap-5">
          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow mb-2">Settings</div>
            <ul className="flex flex-col gap-3 text-small">
              <li className="flex items-center justify-between">
                <span>Reminder time</span>
                <Pill tone="slate">08:00</Pill>
              </li>
              <li className="flex items-center justify-between">
                <span>Frequency</span>
                <Pill tone="neutral">{habit.frequencyLabel}</Pill>
              </li>
              <li className="flex items-center justify-between">
                <span>Gentle mode</span>
                <Pill tone="moss">on</Pill>
              </li>
            </ul>
            {/*
             * @behavior: Edit habit settings (cadence, reminder, mode).
             * @convex-mutation-needed: habits.updateSettings
             */}
            <Button
              variant="soft"
              size="sm"
              className="mt-3"
              onClick={() => toast("Saved. (demo) habits.updateSettings.")}
            >
              Edit settings
            </Button>
          </SoftCard>

          <SoftCard tone="sunken" padding="md">
            <div className="font-eyebrow mb-2">Notes</div>
            <p className="text-small text-muted-foreground">
              Two skipped days last week. Nothing is broken — just noticing.
            </p>
          </SoftCard>
        </div>
      </div>
    </div>
  );
}
