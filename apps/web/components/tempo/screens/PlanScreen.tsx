"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { mockEvents, mockTasks } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

/**
 * PlanScreen — guided planning flow. Drag-and-drop is simulated via buttons.
 * @source docs/design/claude-export/design-system/screens-1.jsx (ScreenPlan)
 */
export function PlanScreen() {
  const router = useRouter();
  const toast = useDemoToast();
  const [intake, setIntake] = useState(mockTasks.map((t) => t.id));
  const [plan, setPlan] = useState<string[]>([]);

  const intakeItems = useMemo(
    () => mockTasks.filter((t) => intake.includes(t.id)),
    [intake],
  );
  const planItems = useMemo(
    () => mockTasks.filter((t) => plan.includes(t.id)),
    [plan],
  );

  const stage = (id: string) => {
    setIntake((prev) => prev.filter((p) => p !== id));
    setPlan((prev) => [...prev, id]);
    toast("Staged. (demo) plans.stageTask.");
  };
  const unstage = (id: string) => {
    setPlan((prev) => prev.filter((p) => p !== id));
    setIntake((prev) => [...prev, id]);
  };

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Planning"
        title="Stage today, gently."
        lede="Drag anchors from intake into today's plan. Coach can help if you let it."
        right={
          <>
            {/*
             * @behavior: Trigger coach to propose a staged plan from intake + energy.
             * @convex-action-needed: coach.proposePlan
             * @provider-needed: openrouter
             */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => toast("Coach is drafting. (demo) coach.proposePlan.")}
            >
              ✨ Let coach draft it
            </Button>
            {/*
             * @behavior: Commit the current plan as today's anchors.
             * @convex-mutation-needed: plans.commitPlan
             * @navigate: /today
             * @confirm: undoable 10s
             */}
            <Button
              variant="soft"
              size="sm"
              onClick={() => {
                toast("Plan committed. (demo) plans.commitPlan.");
                router.push("/today");
              }}
            >
              Commit plan
            </Button>
          </>
        }
      />

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-3">
        <SoftCard tone="default" padding="md">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="font-eyebrow">Intake</div>
              <h3 className="text-h4 font-serif">{intakeItems.length} unstaged</h3>
            </div>
            <Pill tone="neutral">from today</Pill>
          </div>
          <div className="flex flex-col gap-2">
            {intakeItems.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg bg-surface-sunken p-3"
              >
                <div className="flex min-w-0 flex-1 flex-col pr-2">
                  <span className="truncate text-body">{task.title}</span>
                  <span className="text-caption text-muted-foreground">
                    {task.dueDateLabel} · {task.estimateMinutes}m
                  </span>
                </div>
                {/*
                 * @behavior: Stage this task into today's plan.
                 * @convex-mutation-needed: plans.stageTask
                 */}
                <Button variant="soft" size="sm" onClick={() => stage(task.id)}>
                  → Stage
                </Button>
              </div>
            ))}
            {intakeItems.length === 0 ? (
              <p className="text-center text-small text-muted-foreground">
                All staged. Nice.
              </p>
            ) : null}
          </div>
        </SoftCard>

        <SoftCard tone="default" padding="md">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="font-eyebrow">Today's plan</div>
              <h3 className="text-h4 font-serif">{planItems.length} anchors</h3>
            </div>
            <Pill tone="orange">staged</Pill>
          </div>
          <div className="flex flex-col gap-2">
            {planItems.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg border border-primary/30 bg-card p-3"
              >
                <div className="flex min-w-0 flex-1 flex-col pr-2">
                  <span className="truncate text-body">{task.title}</span>
                  <span className="text-caption text-muted-foreground">
                    {task.estimateMinutes}m · {task.energy} energy
                  </span>
                </div>
                {/*
                 * @behavior: Unstage this task from today's plan.
                 * @convex-mutation-needed: plans.unstageTask
                 */}
                <Button variant="ghost" size="sm" onClick={() => unstage(task.id)}>
                  ← Unstage
                </Button>
              </div>
            ))}
            {planItems.length === 0 ? (
              <p className="text-center text-small text-muted-foreground">
                Nothing staged yet. Pick one thing that would make today feel
                okay.
              </p>
            ) : null}
          </div>
        </SoftCard>

        <SoftCard tone="sunken" padding="md">
          <div className="mb-3 font-eyebrow">Calendar</div>
          <div className="flex flex-col gap-2">
            {mockEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between rounded-lg bg-card p-3"
              >
                <div>
                  <div className="text-small">{ev.title}</div>
                  <div className="font-tabular text-caption text-muted-foreground">
                    {ev.startLabel}
                    {ev.endLabel ? ` – ${ev.endLabel}` : ""}
                  </div>
                </div>
                <Pill tone={ev.lane === "scheduled" ? "slate" : "amber"}>
                  {ev.lane}
                </Pill>
              </div>
            ))}
          </div>
          <p className="pt-3 text-caption text-muted-foreground">
            Connect a calendar to auto-stage around meetings.
          </p>
          {/*
           * @behavior: Open calendar integrations settings page.
           * @navigate: /settings/integrations
           * @provider-needed: google-calendar / apple-calendar
           */}
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => router.push("/settings/integrations")}
          >
            Integrations →
          </Button>
        </SoftCard>
      </div>
    </div>
  );
}
