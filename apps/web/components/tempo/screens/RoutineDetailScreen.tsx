"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Pill, Ring, SoftCard } from "@tempo/ui/primitives";
import { mockRoutines } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

type Props = { routineId: string };

const DEMO_STEPS = [
  "Hydrate + meds check",
  "Top 3 intention",
  "10-minute walk",
  "Shoulders drop breath (60s)",
  "Capture a gratitude",
];

/**
 * RoutineDetailScreen — guided routine run w/ step-by-step progress.
 * @source docs/design/claude-export/design-system/screens-3.jsx (ScreenRoutineRun)
 */
export function RoutineDetailScreen({ routineId }: Props) {
  const router = useRouter();
  const toast = useDemoToast();
  const routine = useMemo(
    () => mockRoutines.find((r) => r.id === routineId) ?? mockRoutines[0],
    [routineId],
  );
  const steps = DEMO_STEPS.slice(0, routine.steps);
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < steps.length - 1) {
      setCurrent((c) => c + 1);
      toast("Next step. (demo) routines.logStepComplete.");
    } else {
      toast("Routine complete. (demo) routines.endRun.");
      router.push("/routines");
    }
  };

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow={routine.schedule}
        title={routine.title}
        lede={`Step ${current + 1} of ${steps.length}`}
        right={
          <Ring size={44} value={current + 1} max={steps.length}>
            <span className="font-tabular text-small">
              {Math.round(((current + 1) / steps.length) * 100)}%
            </span>
          </Ring>
        }
      />

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SoftCard tone="default" padding="lg">
          <div className="font-eyebrow">Current step</div>
          <h2 className="mt-1 font-serif text-h2">{steps[current]}</h2>
          <p className="mt-3 text-body text-muted-foreground">
            Frontend-only demo: click Next to advance. Real routine runs persist
            step completions and timing via <code>routines.logStepComplete</code>.
          </p>

          <div className="mt-6 flex items-center gap-3">
            {/*
             * @behavior: Mark current step complete and advance.
             * @convex-mutation-needed: routines.logStepComplete
             * @optimistic: advance locally
             */}
            <Button variant="primary" size="lg" onClick={next}>
              {current < steps.length - 1 ? "Next step →" : "Finish"}
            </Button>
            {/*
             * @behavior: Skip the current step without penalty.
             * @convex-mutation-needed: routines.skipStep
             */}
            <Button
              variant="soft"
              size="lg"
              onClick={() => {
                toast("Skipped. (demo) routines.skipStep.");
                if (current < steps.length - 1) setCurrent((c) => c + 1);
              }}
            >
              Skip
            </Button>
            {/*
             * @behavior: Pause the routine; resume later from here.
             * @convex-mutation-needed: routines.pauseRun
             */}
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                toast("Paused. (demo) routines.pauseRun.");
                router.push("/routines");
              }}
            >
              Pause
            </Button>
          </div>
        </SoftCard>

        <SoftCard tone="sunken" padding="md">
          <div className="font-eyebrow mb-2">Steps</div>
          <ol className="flex flex-col gap-2 text-small">
            {steps.map((step, i) => (
              <li
                key={step}
                className={[
                  "flex items-center gap-3 rounded-lg p-2",
                  i < current
                    ? "text-muted-foreground line-through"
                    : i === current
                      ? "bg-card text-foreground"
                      : "text-muted-foreground",
                ].join(" ")}
              >
                <span className="font-tabular text-caption">{i + 1}</span>
                <span>{step}</span>
                {i < current ? <Pill tone="moss">done</Pill> : null}
              </li>
            ))}
          </ol>
        </SoftCard>
      </div>
    </div>
  );
}
