/**
 * @screen: project-kanban
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 * @queries: tasks.listByProject grouped by column (Long Run 2)
 * @mutations: tasks.moveColumn (Long Run 2)
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { mockProjectKanbanColumns } from "@tempo/mock-data";
import { SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [mode, setMode] = useState<ViewMode>("ready");

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="space-y-6 p-6 pb-24 md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/projects/${id}`}
            className="text-small text-muted-foreground hover:text-foreground"
          >
            ← Project
          </Link>
        </div>
        <header>
          <p className="font-eyebrow text-muted-foreground">Kanban</p>
          <h1 className="text-h1 font-serif text-foreground">Board view</h1>
        </header>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {mockProjectKanbanColumns.map((col) => (
            <SoftCard key={col.title} padding="md" className="w-72 shrink-0">
              <h2 className="font-medium text-foreground">{col.title}</h2>
              <ul className="mt-3 space-y-2">
                {col.items.map((item) => (
                  <li key={item}>
                    {/*
                      @action moveKanbanCard
                      @mutation: tasks.setColumn (Long Run 2)
                      @optimistic: card moves columns
                      @auth: required
                      @errors: toast
                      @env: NEXT_PUBLIC_CONVEX_URL
                    */}
                    <button
                      type="button"
                      className="w-full rounded-lg border border-border-soft bg-surface-sunken/50 px-3 py-2 text-left text-small text-foreground hover:bg-surface-sunken"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </SoftCard>
          ))}
        </div>

        <Link
          href={`/projects/${id}`}
          className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-body font-medium text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
        >
          List view
        </Link>
      </div>
    </ScreenSurface>
  );
}
