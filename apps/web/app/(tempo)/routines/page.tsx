/**
 * @screen: routines
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-2.jsx / screens-3.jsx
 * @queries: routines.listByUser (Long Run 2; @todo: requires schema add routines)
 * @mutations: routines.softDelete
 * @routes-to: /routines/[id]
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { mockRoutineListMeta, mockRoutines } from "@tempo/mock-data";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { Plus } from "@tempo/ui/icons";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");

  const metaById = useMemo(() => {
    const m = new Map<string, (typeof mockRoutineListMeta)[number]>();
    for (const x of mockRoutineListMeta) {
      m.set(x.routineId, x);
    }
    return m;
  }, []);

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-4xl space-y-8 p-6 pb-24 md:p-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-eyebrow text-muted-foreground">Library · Routines</p>
            <h1 className="text-h1 font-serif text-foreground">Sequences that hold.</h1>
          </div>
          {/*
            @action createRoutine
            @mutation: routines.create (Long Run 2)
            @auth: required
            @errors: toast
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button type="button" variant="primary" leadingIcon={<Plus size={14} />}>
            New routine
          </Button>
        </header>

        <ul className="space-y-3">
          {mockRoutines.map((r) => {
            const meta = metaById.get(r.id);
            return (
              <li key={r.id}>
                <SoftCard padding="md">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Link href={`/routines/${r.id}`} className="font-serif text-xl text-foreground hover:underline">
                        {r.name}
                      </Link>
                      <p className="text-caption text-muted-foreground">{r.description}</p>
                      {meta ? (
                        <p className="text-small text-muted-foreground">
                          {meta.scheduleLabel} · last {meta.lastLabel} · {meta.completionRate}% completion
                        </p>
                      ) : null}
                    </div>
                    <Pill tone="slate">{r.steps.length} steps</Pill>
                  </div>
                </SoftCard>
              </li>
            );
          })}
        </ul>
      </div>
    </ScreenSurface>
  );
}
