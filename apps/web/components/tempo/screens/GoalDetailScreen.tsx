"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Pill, Ring, SoftCard } from "@tempo/ui/primitives";
import { mockGoals } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

type Props = { goalId: string };

const DEMO_MILESTONES = [
  { id: "m1", title: "Ship landing + onboarding", done: true },
  { id: "m2", title: "Wire Convex Auth in production", done: false },
  { id: "m3", title: "Launch to 50 beta testers", done: false },
  { id: "m4", title: "Public launch on Twitter + HN", done: false },
];

/**
 * GoalDetailScreen — single goal with milestones + linked tasks.
 * @source docs/design/claude-export/design-system/screens-4.jsx (ScreenGoalDetail)
 */
export function GoalDetailScreen({ goalId }: Props) {
  const router = useRouter();
  const toast = useDemoToast();
  const goal = useMemo(
    () => mockGoals.find((g) => g.id === goalId) ?? mockGoals[0],
    [goalId],
  );
  const [milestones, setMilestones] = useState(DEMO_MILESTONES);
  const done = milestones.filter((m) => m.done).length;

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow={goal.dueDateLabel}
        title={goal.title}
        lede={`${done} of ${milestones.length} milestones done.`}
        right={
          <>
            <Ring size={44} value={goal.progressPercent} max={100}>
              <span className="font-tabular text-small">{goal.progressPercent}%</span>
            </Ring>
            {/*
             * @behavior: Back to the goals index.
             * @navigate: /goals
             */}
            <Button variant="ghost" size="sm" onClick={() => router.push("/goals")}>
              ← Goals
            </Button>
          </>
        }
      />

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SoftCard tone="default" padding="md">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-eyebrow">Milestones</div>
            {/*
             * @behavior: Add a milestone row inline.
             * @convex-mutation-needed: goals.addMilestone
             */}
            <Button
              variant="soft"
              size="sm"
              onClick={() => toast("Added. (demo) goals.addMilestone.")}
            >
              + Milestone
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {milestones.map((ms) => (
              <div
                key={ms.id}
                className="flex items-center justify-between rounded-lg bg-surface-sunken p-3"
              >
                {/*
                 * @behavior: Toggle milestone done state.
                 * @convex-mutation-needed: goals.toggleMilestoneDone
                 */}
                <button
                  type="button"
                  onClick={() =>
                    setMilestones((prev) =>
                      prev.map((m) =>
                        m.id === ms.id ? { ...m, done: !m.done } : m,
                      ),
                    )
                  }
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <span
                    className={[
                      "h-5 w-5 rounded-md border transition-colors",
                      ms.done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border",
                    ].join(" ")}
                    aria-hidden
                  />
                  <span className={ms.done ? "line-through text-muted-foreground" : ""}>
                    {ms.title}
                  </span>
                </button>
                <Pill tone={ms.done ? "moss" : "neutral"}>{ms.done ? "done" : "open"}</Pill>
              </div>
            ))}
          </div>
        </SoftCard>

        <div className="flex flex-col gap-5">
          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow mb-2">Linked tasks</div>
            <ul className="flex flex-col gap-2 text-small text-muted-foreground">
              <li>✅ Ship mobile preview v1</li>
              <li>✅ Review PR from Sam</li>
              <li>🔲 Write launch post</li>
            </ul>
          </SoftCard>

          <SoftCard tone="sunken" padding="md">
            <div className="font-eyebrow mb-2">Coach suggestion</div>
            <p className="text-small text-muted-foreground">
              Three high-energy mornings this week could get you to 80% on this
              goal. Want coach to draft a weekly plan?
            </p>
            {/*
             * @behavior: Ask the coach to propose a weekly plan against this goal.
             * @convex-action-needed: coach.proposeGoalPlan
             * @provider-needed: openrouter
             * @confirm: accept / edit / reject
             */}
            <Button
              variant="primary"
              size="sm"
              className="mt-3"
              onClick={() => toast("Drafting. (demo) coach.proposeGoalPlan.")}
            >
              Draft a plan
            </Button>
          </SoftCard>
        </div>
      </div>
    </div>
  );
}
