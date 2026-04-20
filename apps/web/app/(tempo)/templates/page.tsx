/**
 * @screen: templates
 * @category: You
 * @source: docs/design/claude-export/design-system/screens-templates.jsx
 * @queries: templates.listStarters, templates.listMine (Long Run 2; @todo: requires schema add templates)
 * @mutations: templates.forkStarter
 * @routes-to: /templates/builder, /templates/run/[id], /templates/editor/[id]
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { mockMyTemplates, mockTemplateStarters } from "@tempo/mock-data";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { Plus } from "@tempo/ui/icons";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>("ready");

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-5xl space-y-10 p-6 pb-24 md:p-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-eyebrow text-muted-foreground">Templates</p>
            <h1 className="text-h1 font-serif text-foreground">Reusable rhythms.</h1>
          </div>
          {/*
            @action openTemplateBuilder
            @navigate: /templates/builder
            @mutation: templates.createDraft (Long Run 2)
            @auth: required
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button type="button" variant="primary" leadingIcon={<Plus size={14} />} onClick={() => router.push("/templates/builder")}>
            New template
          </Button>
        </header>

        <section aria-labelledby="starters-heading">
          <h2 id="starters-heading" className="mb-4 font-eyebrow text-muted-foreground">
            Starters
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockTemplateStarters.map((t) => (
              <SoftCard key={t.id} padding="md" className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl" aria-hidden>
                    {t.emoji}
                  </span>
                  {t.starred ? <Pill tone="moss">Popular</Pill> : null}
                </div>
                <h3 className="font-serif text-lg text-foreground">{t.name}</h3>
                <p className="flex-1 text-small text-muted-foreground">{t.description}</p>
                <p className="text-caption text-muted-foreground">
                  {t.stepCount} steps · {t.kicker}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {/*
                    @action runTemplateStarter
                    @navigate: /templates/run/{id}
                    @query: templates.getById
                    @auth: required
                    @env: NEXT_PUBLIC_CONVEX_URL
                  */}
                  <Button type="button" size="sm" variant="primary" onClick={() => router.push(`/templates/run/${t.id}`)}>
                    Run
                  </Button>
                  {/*
                    @action forkTemplateStarter
                    @mutation: templates.fork (Long Run 2)
                    @auth: required
                    @errors: toast
                    @env: NEXT_PUBLIC_CONVEX_URL
                  */}
                  <Button type="button" size="sm" variant="soft">
                    Fork
                  </Button>
                </div>
              </SoftCard>
            ))}
          </div>
        </section>

        <section aria-labelledby="mine-heading">
          <h2 id="mine-heading" className="mb-4 font-eyebrow text-muted-foreground">
            My templates
          </h2>
          <ul className="space-y-3">
            {mockMyTemplates.map((t) => (
              <li key={t.id}>
                <SoftCard padding="md" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden>
                      {t.emoji}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{t.name}</p>
                      <p className="text-caption text-muted-foreground">{t.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="soft" onClick={() => router.push(`/templates/editor/${t.id}`)}>
                      Edit
                    </Button>
                    <Button type="button" size="sm" variant="primary" onClick={() => router.push(`/templates/run/${t.id}`)}>
                      Run
                    </Button>
                  </div>
                </SoftCard>
              </li>
            ))}
          </ul>
        </section>

        {/*
          @action openTemplateSketch
          @navigate: /templates/sketch
          @auth: required
          @env: NEXT_PUBLIC_CONVEX_URL
        */}
        <Button type="button" variant="ghost" onClick={() => router.push("/templates/sketch")}>
          Open sketch mode
        </Button>
      </div>
    </ScreenSurface>
  );
}
