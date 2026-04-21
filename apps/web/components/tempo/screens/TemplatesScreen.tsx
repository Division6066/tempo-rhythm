"use client";

import { useRouter } from "next/navigation";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { mockTemplates } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

/**
 * TemplatesScreen — template gallery.
 * @source docs/design/claude-export/design-system/screens-templates.jsx
 */
export function TemplatesScreen() {
  const router = useRouter();
  const toast = useDemoToast();

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="You"
        title="Templates"
        lede="Reusable scaffolds for planning, journaling, and projects."
        right={
          <>
            {/*
             * @behavior: Open builder to create a new template from scratch or picture.
             * @navigate: /templates/builder
             */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/templates/builder")}
            >
              + Build template
            </Button>
            {/*
             * @behavior: Upload a hand sketch and let AI parse into template structure.
             * @navigate: /templates/sketch
             * @convex-action-needed: templates.parseSketch
             * @provider-needed: openrouter
             */}
            <Button
              variant="soft"
              size="sm"
              onClick={() => router.push("/templates/sketch")}
            >
              📷 From sketch
            </Button>
          </>
        }
      />

      <div className="grid gap-5 px-6 py-6 md:grid-cols-3">
        {mockTemplates.map((template) => (
          <SoftCard key={template.id} tone="default" padding="md">
            <div className="font-eyebrow">{template.type.replaceAll("_", " ")}</div>
            <h3 className="mt-1 font-serif text-h4">{template.title}</h3>
            <p className="mt-2 text-small text-muted-foreground">{template.summary}</p>
            <div className="mt-3 flex items-center gap-2">
              <Pill tone="slate">{template.generationMethod.replaceAll("_", " ")}</Pill>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {/*
               * @behavior: Apply this template to today; opens guided run.
               * @navigate: /templates/run/{templateId}
               * @convex-mutation-needed: templates.startRun
               */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  toast("Starting. (demo) templates.startRun.");
                  router.push(`/templates/run/${template.id}`);
                }}
              >
                Use it
              </Button>
              {/*
               * @behavior: Open template editor to tweak copy and steps.
               * @navigate: /templates/editor/{templateId}
               */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/templates/editor/${template.id}`)}
              >
                Edit
              </Button>
            </div>
          </SoftCard>
        ))}
      </div>
    </div>
  );
}
