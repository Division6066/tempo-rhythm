"use client";

import { useRouter } from "next/navigation";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { mockRoutines } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

/**
 * RoutinesScreen — guided daily/weekly routine library.
 * @source docs/design/claude-export/design-system/screens-3.jsx (ScreenRoutines)
 */
export function RoutinesScreen() {
  const router = useRouter();
  const toast = useDemoToast();

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Library"
        title="Routines"
        lede="Start-up sequences, shutdown rituals, everything repeatable."
        right={
          <>
            {/*
             * @behavior: Create a routine from scratch.
             * @convex-mutation-needed: routines.createBlank
             * @navigate: /routines/{newId}
             */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => toast("Created. (demo) routines.createBlank.")}
            >
              + New routine
            </Button>
          </>
        }
      />

      <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
        {mockRoutines.map((routine) => (
          <SoftCard key={routine.id} tone="default" padding="md">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="font-eyebrow">{routine.schedule}</div>
                {/*
                 * @behavior: Open routine detail with step list.
                 * @navigate: /routines/{routineId}
                 */}
                <button
                  type="button"
                  className="text-left font-serif text-h4 hover:underline"
                  onClick={() => router.push(`/routines/${routine.id}`)}
                >
                  {routine.title}
                </button>
                <div className="flex items-center gap-2">
                  <Pill tone="neutral">{routine.steps} steps</Pill>
                  <Pill tone="moss">{routine.completionRatePercent}% complete</Pill>
                </div>
              </div>
              {/*
               * @behavior: Start guided routine run now.
               * @convex-mutation-needed: routines.startRun
               * @navigate: /routines/{routineId}
               */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  toast("Starting. (demo) routines.startRun.");
                  router.push(`/routines/${routine.id}`);
                }}
              >
                ▶ Start
              </Button>
            </div>
          </SoftCard>
        ))}
      </div>
    </div>
  );
}
