"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

/**
 * TemplateSketchScreen — upload a hand sketch, preview AI-parsed structure.
 * @source docs/design/claude-export/design-system/screens-5.jsx (template sketch)
 */
export function TemplateSketchScreen() {
  const router = useRouter();
  const toast = useDemoToast();
  const [parsed, setParsed] = useState(false);

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Templates"
        title="From sketch"
        lede="Photograph or scan a page of your planner. AI parses it into a structured template."
        right={
          <Button variant="ghost" size="sm" onClick={() => router.push("/templates")}>
            ← Templates
          </Button>
        }
      />

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SoftCard tone="default" padding="lg">
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-soft bg-surface-sunken p-6 text-center">
            <span aria-hidden className="text-4xl">🖼</span>
            <p className="text-body text-muted-foreground">
              Drop a photo of your sketch here, or pick one from your files.
            </p>
            <div className="flex items-center gap-2">
              {/*
               * @behavior: Upload a sketch image; RAM-only until parsed.
               * @convex-action-needed: templates.parseSketch
               * @provider-needed: openrouter (vision model)
               */}
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setParsed(true);
                  toast("Parsing. (demo) templates.parseSketch.");
                }}
              >
                Choose file
              </Button>
              {/*
               * @behavior: Capture a photo via device camera (PWA mobile).
               * @convex-action-needed: templates.parseSketch
               */}
              <Button
                variant="soft"
                size="md"
                onClick={() => toast("Camera captured. (demo)")}
              >
                📷 Use camera
              </Button>
            </div>
          </div>
        </SoftCard>

        <SoftCard tone="default" padding="md">
          <div className="font-eyebrow mb-2">Parsed structure</div>
          {!parsed ? (
            <p className="text-small text-muted-foreground">
              Upload a sketch to see how Tempo would interpret it.
            </p>
          ) : (
            <>
              <h3 className="font-serif text-h4">Weekly review (parsed)</h3>
              <ol className="mt-2 flex flex-col gap-2 text-small">
                <li>
                  <Pill tone="slate">section</Pill> Energy + mood
                </li>
                <li>
                  <Pill tone="orange">task</Pill> Top 3 intentions
                </li>
                <li>
                  <Pill tone="moss">prompt</Pill> What am I avoiding?
                </li>
                <li>
                  <Pill tone="orange">task</Pill> Gentle wins column
                </li>
              </ol>
              <div className="mt-4 flex gap-2">
                {/*
                 * @behavior: Accept parsed sketch into a new editable template.
                 * @convex-mutation-needed: templates.createFromSketch
                 * @confirm: accept / edit / reject before apply
                 */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    toast("Saved. (demo) templates.createFromSketch.");
                    router.push("/templates");
                  }}
                >
                  Save template
                </Button>
                {/*
                 * @behavior: Open full builder with this structure pre-filled.
                 * @navigate: /templates/builder
                 */}
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => router.push("/templates/builder")}
                >
                  Edit in builder
                </Button>
              </div>
            </>
          )}
        </SoftCard>
      </div>
    </div>
  );
}
