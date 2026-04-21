"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  CoachBubble,
  Pill,
  Ring,
  SoftCard,
  TaskRow,
} from "@tempo/ui/primitives";
import {
  mockCoachThread,
  mockHabits,
  mockTasks,
  mockTodayScreen,
  mockUser,
} from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

/**
 * TodayScreen — daily command center. Mock state + click-through only.
 *
 * @source docs/design/claude-export/design-system/screens-1.jsx (ScreenToday)
 */
export function TodayScreen() {
  const router = useRouter();
  const toast = useDemoToast();
  const initialDone = useMemo(
    () => Object.fromEntries(mockTasks.map((t) => [t.id, t.status === "done"])),
    [],
  );
  const [done, setDone] = useState<Record<string, boolean>>(initialDone);
  const [energy, setEnergy] = useState<"low" | "medium" | "high">("medium");

  const total = mockTasks.length;
  const completed = Object.values(done).filter(Boolean).length;
  const latestCoach = mockCoachThread[mockCoachThread.length - 1];

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow={mockTodayScreen.title}
        title={`Good morning, ${mockUser.name}.`}
        lede={mockTodayScreen.greeting}
        right={
          <>
            <div className="text-right">
              <div className="font-eyebrow">Energy</div>
              <div className="flex items-center gap-1 pt-1">
                {(["low", "medium", "high"] as const).map((level) => (
                  <span
                    key={level}
                    className={[
                      "h-2 w-6 rounded-full transition-colors",
                      energy === level
                        ? "bg-primary"
                        : "bg-surface-sunken",
                    ].join(" ")}
                    aria-hidden
                  />
                ))}
              </div>
            </div>
            {/*
             * @behavior: Open the planning flow so the coach can stage today's anchors.
             * @navigate: /plan
             * @convex-action-needed: coach.startPlanningSession
             * @source: docs/design/claude-export/design-system/screens-1.jsx
             */}
            <Button variant="primary" size="sm" onClick={() => router.push("/plan")}>
              Plan with Coach
            </Button>
          </>
        }
      />

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <SoftCard tone="default" padding="md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-eyebrow">Today's anchors</div>
                <h2 className="text-h3 font-serif">
                  {completed} of {total} things
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <Ring size={48} value={completed} max={total}>
                  <span className="font-tabular text-small">
                    {Math.round((completed / Math.max(total, 1)) * 100)}%
                  </span>
                </Ring>
                {/*
                 * @behavior: Open quick-capture modal to add a new task to today.
                 * @convex-mutation-needed: tasks.captureQuickAdd
                 * @navigate: /brain-dump
                 * @source: docs/design/claude-export/design-system/screens-1.jsx
                 */}
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => router.push("/brain-dump")}
                >
                  + Capture
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-1">
              {mockTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  taskId={task.id}
                  title={task.title}
                  meta={`${task.dueDateLabel} · ${task.estimateMinutes}m · ${task.energy} energy`}
                  done={done[task.id]}
                  onToggle={(id, next) => {
                    /*
                     * @behavior: Optimistically toggle a task's done state and persist via mutation.
                     * @convex-mutation-needed: tasks.complete
                     * @convex-query-needed: tasks.listToday
                     * @optimistic: mark locally first, server reconciles
                     * @confirm: undoable 5s
                     */
                    setDone((prev) => ({ ...prev, [id]: next }));
                    toast(
                      next
                        ? "Nice. (demo) tasks.complete would run here."
                        : "Uncompleted. (demo) tasks.reopen would run here.",
                    );
                  }}
                  trailing={
                    <Pill
                      tone={
                        task.energy === "high"
                          ? "amber"
                          : task.energy === "medium"
                            ? "moss"
                            : "neutral"
                      }
                    >
                      {task.estimateMinutes}m
                    </Pill>
                  }
                />
              ))}
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-lg bg-surface-sunken p-3">
              <span aria-hidden className="text-lg">🍃</span>
              <div className="flex-1 text-small text-muted-foreground">
                Two overdue things from yesterday. Carry them to today, or let
                them rest?
              </div>
              {/*
               * @behavior: Accept the coach's proposal to carry overdue items to today.
               * @convex-mutation-needed: tasks.rescheduleToToday
               * @confirm: accept / edit / reject before apply
               */}
              <Button
                variant="soft"
                size="sm"
                onClick={() => toast("Carried over. (demo) tasks.rescheduleToToday.")}
              >
                Carry over
              </Button>
              {/*
               * @behavior: Defer overdue items back to their original date without nagging.
               * @convex-mutation-needed: tasks.letRest
               */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast("Let them rest. (demo)")}
              >
                Let rest
              </Button>
            </div>
          </SoftCard>

          <SoftCard tone="sunken" padding="md">
            <CoachBubble speaker="coach" timestamp={latestCoach.createdAtLabel}>
              {latestCoach.content}
            </CoachBubble>
            <div className="mt-4 flex flex-wrap gap-2">
              {/*
               * @behavior: Accept coach's staged outline and append to today's plan.
               * @convex-mutation-needed: plans.stageOutline
               * @confirm: accept / edit / reject
               * @source: docs/design/claude-export/design-system/screens-1.jsx
               */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push("/coach")}
              >
                Stage the outline
              </Button>
              {/*
               * @behavior: Dismiss coach suggestion and return to plain list.
               * @convex-mutation-needed: coach.dismissSuggestion
               */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast("Dismissed. (demo) coach.dismissSuggestion.")}
              >
                Not now
              </Button>
            </div>
          </SoftCard>
        </div>

        <div className="flex flex-col gap-5">
          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow mb-3">Habits · today</div>
            <div className="flex flex-col gap-3">
              {mockHabits.map((habit) => (
                <div key={habit.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Ring
                      size={34}
                      value={habit.completionPercent}
                      max={100}
                    />
                    <span className="text-body">{habit.title}</span>
                  </div>
                  <Pill tone={habit.completedToday ? "moss" : "amber"}>
                    {habit.completedToday ? `${habit.streak}-day streak` : "due"}
                  </Pill>
                </div>
              ))}
            </div>
          </SoftCard>

          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow mb-3">Up next</div>
            <div className="flex flex-col divide-y divide-border-soft">
              {mockTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center gap-3 py-2 text-small">
                  <span className="font-tabular text-muted-foreground">
                    {task.dueDateLabel.split("·").pop()?.trim()}
                  </span>
                  <span className="flex-1 truncate">{task.title}</span>
                </div>
              ))}
            </div>
          </SoftCard>

          <SoftCard tone="sunken" padding="md">
            <div className="font-eyebrow mb-2">Energy check-in</div>
            <p className="text-small text-muted-foreground">
              {mockTodayScreen.energyPrompt}
            </p>
            <div className="mt-3 flex gap-2">
              {(["low", "medium", "high"] as const).map((level) => (
                /*
                 * @behavior: Persist today's energy self-report used by the planner.
                 * @convex-mutation-needed: plans.setEnergyCheckIn
                 * @schema-delta: plans.energyCheckIn.source
                 * @source: docs/design/claude-export/design-system/screens-1.jsx
                 */
                <Button
                  key={level}
                  variant={energy === level ? "primary" : "soft"}
                  size="sm"
                  onClick={() => {
                    setEnergy(level);
                    toast(`Logged energy: ${level}. (demo) plans.setEnergyCheckIn.`);
                  }}
                >
                  {level}
                </Button>
              ))}
            </div>
          </SoftCard>

          <SoftCard tone="inverse" padding="md">
            <div className="font-eyebrow opacity-70">Pebble of the day</div>
            <p className="pt-2 text-body font-serif leading-relaxed">
              "10 minute walk" beats "some movement." — small, gentle,
              specific.
            </p>
          </SoftCard>
        </div>
      </div>
    </div>
  );
}
