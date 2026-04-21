"use client";

import { useRouter } from "next/navigation";
import { Button, Pill, Ring, SoftCard } from "@tempo/ui/primitives";
import { mockGoals } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

/**
 * GoalsScreen — goal list with progress rings.
 * @source docs/design/claude-export/design-system/screens-4.jsx (ScreenGoals)
 */
export function GoalsScreen() {
  const router = useRouter();
  const toast = useDemoToast();

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Library"
        title="Goals"
        lede="North stars, not to-do items. Decomposed into anchor projects."
        right={
          <>
            {/*
             * @behavior: Navigate to the progress chart view.
             * @navigate: /goals/progress
             */}
            <Button
              variant="soft"
              size="sm"
              onClick={() => router.push("/goals/progress")}
            >
              Progress chart →
            </Button>
            {/*
             * @behavior: Create a new goal with coach decomposition.
             * @convex-mutation-needed: goals.create
             * @convex-action-needed: goals.coachDecompose
             * @provider-needed: openrouter
             */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => toast("Created. (demo) goals.create + coachDecompose.")}
            >
              + New goal
            </Button>
          </>
        }
      />

      <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
        {mockGoals.map((goal) => (
          <SoftCard key={goal.id} tone="default" padding="md">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <div className="font-eyebrow">{goal.dueDateLabel}</div>
                {/*
                 * @behavior: Open goal detail page with milestone tree.
                 * @navigate: /goals/{goalId}
                 */}
                <button
                  type="button"
                  className="text-left font-serif text-h3 hover:underline"
                  onClick={() => router.push(`/goals/${goal.id}`)}
                >
                  {goal.title}
                </button>
                <Pill
                  tone={
                    goal.progressPercent > 70
                      ? "moss"
                      : goal.progressPercent > 30
                        ? "amber"
                        : "brick"
                  }
                >
                  {goal.progressPercent}% complete
                </Pill>
              </div>
              <Ring size={64} value={goal.progressPercent} max={100}>
                <span className="font-tabular text-body">
                  {goal.progressPercent}
                </span>
              </Ring>
            </div>
          </SoftCard>
        ))}
      </div>
    </div>
  );
}
