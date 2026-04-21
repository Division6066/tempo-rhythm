"use client";

import { useRouter } from "next/navigation";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { mockGoals } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

/**
 * GoalsProgressScreen — chart-variant view of goal progress.
 * @source docs/design/claude-export/design-system/screens-4.jsx (ScreenGoalsProgress)
 */
export function GoalsProgressScreen() {
  const router = useRouter();
  const toast = useDemoToast();

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Goals"
        title="Progress chart"
        lede="Where each of your north stars sits right now."
        right={
          <Button variant="ghost" size="sm" onClick={() => router.push("/goals")}>
            ← Goals list
          </Button>
        }
      />

      <div className="px-6 py-6">
        <SoftCard tone="default" padding="lg">
          <div className="flex flex-col gap-6">
            {mockGoals.map((goal) => (
              <div key={goal.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="font-serif text-h4">{goal.title}</div>
                  <div className="flex items-center gap-2">
                    <Pill tone="neutral">{goal.dueDateLabel}</Pill>
                    <Pill
                      tone={
                        goal.progressPercent > 70
                          ? "moss"
                          : goal.progressPercent > 30
                            ? "amber"
                            : "brick"
                      }
                    >
                      {goal.progressPercent}%
                    </Pill>
                  </div>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-surface-sunken">
                  {/*
                   * @behavior: Hover to reveal milestone breakdown; click jumps to detail.
                   * @convex-query-needed: goals.progressSeries
                   */}
                  <button
                    type="button"
                    onClick={() => {
                      toast("Opened series. (demo) goals.progressSeries.");
                      router.push(`/goals/${goal.id}`);
                    }}
                    className="tempo-gradient-bg block h-full transition-all"
                    style={{ width: `${goal.progressPercent}%` }}
                    aria-label={`${goal.title}: ${goal.progressPercent} percent`}
                  />
                </div>
              </div>
            ))}
          </div>
        </SoftCard>

        <SoftCard tone="sunken" padding="md" className="mt-5">
          <div className="font-eyebrow mb-2">Export</div>
          <div className="flex items-center gap-2">
            {/*
             * @behavior: Export progress as a shareable PNG/PDF.
             * @convex-action-needed: goals.exportProgressSnapshot
             */}
            <Button
              variant="soft"
              size="sm"
              onClick={() => toast("Export queued. (demo) goals.exportProgressSnapshot.")}
            >
              Export snapshot
            </Button>
          </div>
        </SoftCard>
      </div>
    </div>
  );
}
