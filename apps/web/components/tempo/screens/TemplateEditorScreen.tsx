"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { mockTemplates } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

type Props = { templateId: string };

/**
 * TemplateEditorScreen — simple section editor for an existing template.
 * @source docs/design/claude-export/design-system/screens-5.jsx (legacy editor)
 */
export function TemplateEditorScreen({ templateId }: Props) {
  const router = useRouter();
  const toast = useDemoToast();
  const template = useMemo(
    () => mockTemplates.find((t) => t.id === templateId) ?? mockTemplates[0],
    [templateId],
  );
  const [title, setTitle] = useState(template.title);
  const [summary, setSummary] = useState(template.summary);

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Templates"
        title={`Edit · ${template.title}`}
        lede="Lightweight tweaks without opening the full builder."
        right={
          <>
            <Button variant="ghost" size="sm" onClick={() => router.push("/templates")}>
              ← Templates
            </Button>
            {/*
             * @behavior: Open full builder for rich structural edits.
             * @navigate: /templates/builder
             */}
            <Button
              variant="soft"
              size="sm"
              onClick={() => router.push("/templates/builder")}
            >
              Open builder →
            </Button>
          </>
        }
      />

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SoftCard tone="default" padding="md">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-small">
              <span className="font-eyebrow">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-lg border border-border-soft bg-surface-sunken px-3 py-2 focus:border-primary focus:outline-none"
                /*
                 * @behavior: Rename template; debounced save.
                 * @convex-mutation-needed: templates.renameTitle
                 */
              />
            </label>
            <label className="flex flex-col gap-1 text-small">
              <span className="font-eyebrow">Summary</span>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="rounded-lg border border-border-soft bg-surface-sunken px-3 py-2 focus:border-primary focus:outline-none"
                /*
                 * @behavior: Save summary; used in template gallery cards.
                 * @convex-mutation-needed: templates.updateSummary
                 */
              />
            </label>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill tone="slate">{template.type.replaceAll("_", " ")}</Pill>
              <Pill tone="neutral">{template.generationMethod.replaceAll("_", " ")}</Pill>
            </div>
            {/*
             * @behavior: Save changes.
             * @convex-mutation-needed: templates.saveEditorChanges
             */}
            <Button
              variant="primary"
              size="md"
              onClick={() => toast("Saved. (demo) templates.saveEditorChanges.")}
            >
              Save changes
            </Button>
          </div>
        </SoftCard>

        <SoftCard tone="sunken" padding="md">
          <div className="font-eyebrow mb-2">Sections</div>
          <ul className="flex flex-col gap-1 text-small text-muted-foreground">
            <li>Morning (3 steps)</li>
            <li>Focus block (2 steps)</li>
            <li>Shutdown (4 steps)</li>
          </ul>
          {/*
           * @behavior: Add a new section to the template.
           * @convex-mutation-needed: templates.addSection
           */}
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => toast("Section added. (demo) templates.addSection.")}
          >
            + Section
          </Button>
        </SoftCard>
      </div>
    </div>
  );
}
