"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Pill, Ring, SoftCard } from "@tempo/ui/primitives";
import { mockTemplates } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

type Props = { templateId: string };

const DEMO_STEPS = [
  { id: "s1", label: "Open brain dump", detail: "Capture anything urgent first." },
  { id: "s2", label: "Pick your top 3", detail: "Three things you could finish today." },
  { id: "s3", label: "Set energy check-in", detail: "Low / medium / high — honest, not aspirational." },
  { id: "s4", label: "Stage the plan", detail: "Ask coach to slot around your calendar." },
];

/**
 * TemplateRunScreen — guided template execution.
 * @source docs/design/claude-export/design-system/screens-template-run.jsx
 */
export function TemplateRunScreen({ templateId }: Props) {
  const router = useRouter();
  const toast = useDemoToast();
  const template = useMemo(
    () => mockTemplates.find((t) => t.id === templateId) ?? mockTemplates[0],
    [templateId],
  );
  const [stepIndex, setStepIndex] = useState(0);
  const step = DEMO_STEPS[stepIndex];
  const progress = ((stepIndex + 1) / DEMO_STEPS.length) * 100;

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow={template.type.replaceAll("_", " ")}
        title={template.title}
        lede={`Step ${stepIndex + 1} of ${DEMO_STEPS.length}`}
        right={
          <Ring size={44} value={stepIndex + 1} max={DEMO_STEPS.length}>
            <span className="font-tabular text-small">
              {Math.round(progress)}%
            </span>
          </Ring>
        }
      />

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SoftCard tone="default" padding="lg">
          <Pill tone="slate">step {stepIndex + 1}</Pill>
          <h2 className="mt-2 font-serif text-h2">{step.label}</h2>
          <p className="mt-3 text-body text-muted-foreground">{step.detail}</p>

          <div className="mt-6 flex items-center gap-3">
            {/*
             * @behavior: Log step complete and advance.
             * @convex-mutation-needed: templates.logStepComplete
             */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                if (stepIndex < DEMO_STEPS.length - 1) {
                  setStepIndex((i) => i + 1);
                  toast("Advanced. (demo) templates.logStepComplete.");
                } else {
                  toast("Finished. (demo) templates.endRun.");
                  router.push("/today");
                }
              }}
            >
              {stepIndex < DEMO_STEPS.length - 1 ? "Next →" : "Finish"}
            </Button>
            {/*
             * @behavior: Skip step without blocking the run.
             * @convex-mutation-needed: templates.skipStep
             */}
            <Button
              variant="soft"
              size="lg"
              onClick={() => {
                toast("Skipped. (demo)");
                if (stepIndex < DEMO_STEPS.length - 1) {
                  setStepIndex((i) => i + 1);
                }
              }}
            >
              Skip
            </Button>
            {/*
             * @behavior: Abandon the run; does not save progress.
             * @convex-mutation-needed: templates.abandonRun
             */}
            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.push("/templates")}
            >
              Cancel
            </Button>
          </div>
        </SoftCard>

        <SoftCard tone="sunken" padding="md">
          <div className="font-eyebrow mb-2">Steps</div>
          <ol className="flex flex-col gap-2 text-small">
            {DEMO_STEPS.map((s, i) => (
              <li
                key={s.id}
                className={[
                  "flex items-center gap-3 rounded-lg p-2",
                  i < stepIndex
                    ? "text-muted-foreground line-through"
                    : i === stepIndex
                      ? "bg-card text-foreground"
                      : "text-muted-foreground",
                ].join(" ")}
              >
                <span className="font-tabular text-caption">{i + 1}</span>
                <span>{s.label}</span>
              </li>
            ))}
          </ol>
        </SoftCard>
      </div>
    </div>
  );
}
