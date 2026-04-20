/**
 * @screen: template-run
 * @category: You (bare shell)
 * @source: docs/design/claude-export/design-system/screens-template-run.jsx
 * @queries: templates.getById, templateRuns.getActive (Long Run 2)
 * @mutations: templateRuns.completeStep, templateRuns.finish
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { mockMyTemplates, mockRoutines, mockTemplateStarters } from "@tempo/mock-data";
import { Button, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

function resolveTemplate(id: string) {
  const starter = mockTemplateStarters.find((t) => t.id === id);
  if (starter) {
    return { title: starter.name, steps: mockRoutines.find((r) => r.id === "routine-weekly")?.steps ?? [] };
  }
  const mine = mockMyTemplates.find((t) => t.id === id);
  if (mine) {
    return {
      title: mine.name,
      steps: mockRoutines.find((r) => r.id === "routine-morning")?.steps ?? [],
    };
  }
  return { title: "Template", steps: mockRoutines[0]?.steps ?? [] };
}

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [mode, setMode] = useState<ViewMode>("ready");
  const [idx, setIdx] = useState(0);

  const { title, steps } = useMemo(() => resolveTemplate(id), [id]);
  const step = steps[idx];
  const total = steps.length;

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-lg space-y-8 p-6 pb-24 md:p-8">
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-serif text-2xl text-foreground">{title}</h1>
          <Button type="button" variant="ghost" size="sm" onClick={() => router.push("/templates")}>
            Exit
          </Button>
        </div>
        <p className="text-caption text-muted-foreground">
          Step {Math.min(idx + 1, Math.max(total, 1))} of {Math.max(total, 1)}
        </p>
        {step ? (
          <SoftCard padding="lg">
            <p className="font-medium text-foreground">{step.title}</p>
            <p className="mt-2 text-caption text-muted-foreground">{step.durationMin} min</p>
          </SoftCard>
        ) : (
          <SoftCard padding="md">
            <p className="text-muted-foreground">No steps in mock for this id.</p>
          </SoftCard>
        )}
        <div className="flex gap-2">
          {/*
            @action templateRunPrevious
            @mutation: templateRuns.seek (Long Run 2)
            @auth: required
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button type="button" variant="soft" disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}>
            Back
          </Button>
          {/*
            @action templateRunNext
            @mutation: templateRuns.advanceStep
            @auth: required
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button
            type="button"
            variant="primary"
            className="flex-1"
            onClick={() => {
              if (idx < total - 1) {
                setIdx((i) => i + 1);
              } else {
                router.push("/templates");
              }
            }}
          >
            {idx < total - 1 ? "Next" : "Done"}
          </Button>
        </div>
      </div>
    </ScreenSurface>
  );
}
