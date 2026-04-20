/**
 * @screen: projects
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 * @queries: projects.listByUser (Long Run 2; @todo: requires schema add projects)
 * @mutations: projects.create
 * @routes-to: /projects/[id]
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { mockProjectCards, mockProjects } from "@tempo/mock-data";
import { Button, Pill, Ring, SoftCard } from "@tempo/ui/primitives";
import { Plus } from "@tempo/ui/icons";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

const colorBorder: Record<(typeof mockProjects)[0]["color"], string> = {
  orange: "border-l-[color:var(--color-tempo-orange)]",
  amber: "border-l-[color:var(--color-amber)]",
  moss: "border-l-[color:var(--color-moss)]",
  brick: "border-l-[color:var(--color-brick)]",
  slate: "border-l-[color:var(--color-slate-blue)]",
};

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");

  const cardById = useMemo(() => {
    const m = new Map<string, (typeof mockProjectCards)[number]>();
    for (const c of mockProjectCards) {
      m.set(c.projectId, c);
    }
    return m;
  }, []);

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-4xl space-y-8 p-6 pb-24 md:p-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-eyebrow text-muted-foreground">Projects</p>
            <h1 className="text-h1 font-serif text-foreground">Containers for momentum.</h1>
          </div>
          {/*
            @action createProject
            @mutation: projects.create (Long Run 2)
            @auth: required
            @errors: toast
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button type="button" variant="primary" leadingIcon={<Plus size={14} />}>
            New project
          </Button>
        </header>

        <ul className="space-y-3">
          {mockProjects.map((p) => {
            const card = cardById.get(p.id);
            return (
              <li key={p.id}>
                <SoftCard
                  padding="md"
                  className={["border-l-4", colorBorder[p.color]].filter(Boolean).join(" ")}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link href={`/projects/${p.id}`} className="min-w-0 flex-1 space-y-1">
                      <h2 className="font-serif text-xl text-foreground hover:underline">{p.name}</h2>
                      {card ? (
                        <p className="text-small text-muted-foreground">
                          Due {card.dueLabel} · {card.taskCount} tasks · {card.teamSize}{" "}
                          teammate
                        </p>
                      ) : null}
                    </Link>
                    {card ? (
                      <div className="flex items-center gap-2">
                        <Ring size={44} stroke={3} value={card.percent} max={100}>
                          <span className="text-caption font-tabular">{card.percent}</span>
                        </Ring>
                        <Pill tone="slate">{p.taskIds.length} linked tasks</Pill>
                      </div>
                    ) : null}
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
