/**
 * @screen: routine-detail
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-3.jsx
 * @queries: routines.getById (Long Run 2)
 * @mutations: routineRuns.start (Long Run 2)
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { mockRoutines } from "@tempo/mock-data";
import { Button, SoftCard } from "@tempo/ui/primitives";
import { Check } from "@tempo/ui/icons";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [mode, setMode] = useState<ViewMode>("ready");
  const [stepDone, setStepDone] = useState<Record<string, boolean>>({});

  const routine = useMemo(() => mockRoutines.find((r) => r.id === id) ?? null, [id]);

  const toggleStep = (stepId: string) => {
    setStepDone((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  if (!routine) {
    return (
      <ScreenSurface mode={mode} onModeChange={setMode}>
        <div className="p-8">
          <SoftCard padding="md">
            <p className="text-muted-foreground">Routine not found.</p>
            <Link href="/routines" className="mt-4 inline-block text-primary underline">
              Back to routines
            </Link>
          </SoftCard>
        </div>
      </ScreenSurface>
    );
  }

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-3xl space-y-8 p-6 pb-24 md:p-8">
        <Link href="/routines" className="text-small text-muted-foreground hover:text-foreground">
          ← Routines
        </Link>
        <header>
          <h1 className="text-h1 font-serif text-foreground">{routine.name}</h1>
          <p className="mt-1 text-body text-muted-foreground">{routine.description}</p>
        </header>

        {/*
          @action startGuidedRoutine
          @mutation: routineRuns.start (Long Run 2)
          @auth: required
          @errors: toast
          @env: NEXT_PUBLIC_CONVEX_URL
        */}
        <Button type="button" variant="primary">
          Start guided run
        </Button>

        <ol className="space-y-3">
          {routine.steps.map((s, idx) => (
            <li key={s.id}>
              <SoftCard padding="md" className="flex items-start gap-3">
                <span className="font-tabular text-caption text-muted-foreground">{idx + 1}.</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{s.title}</p>
                  <p className="text-caption text-muted-foreground">{s.durationMin} min</p>
                </div>
                {/*
                  @action toggleRoutineStep
                  @mutation: routineRuns.completeStep (Long Run 2)
                  @auth: required
                  @errors: toast
                  @env: NEXT_PUBLIC_CONVEX_URL
                */}
                <button
                  type="button"
                  aria-pressed={Boolean(stepDone[s.id])}
                  aria-label={stepDone[s.id] ? `Mark step ${s.title} not done` : `Mark step ${s.title} done`}
                  onClick={() => toggleStep(s.id)}
                  className={[
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                    stepDone[s.id]
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary",
                  ].join(" ")}
                >
                  {stepDone[s.id] ? <Check size={16} strokeWidth={2.5} /> : null}
                </button>
              </SoftCard>
            </li>
          ))}
        </ol>
      </div>
    </ScreenSurface>
  );
}
