/**
 * @screen: goals-progress
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 * @queries: goals.listByUser withIndex("by_userId_status")
 * @mutations: none (read-only chart in MVP)
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import Link from "next/link";
import { useState } from "react";
import { mockGoals } from "@tempo/mock-data";
import { SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-4xl space-y-8 p-6 pb-24 md:p-8">
        <div className="flex items-center gap-4">
          <Link href="/goals" className="text-small text-muted-foreground hover:text-foreground">
            ← Goals
          </Link>
        </div>
        <header>
          <p className="font-eyebrow text-muted-foreground">Goals · Progress</p>
          <h1 className="text-h1 font-serif text-foreground">How it&apos;s moving.</h1>
          <p className="mt-2 text-body text-muted-foreground">
            Snapshot from mock data — Long Run 2 charts from goals.progressPercent via Convex.
          </p>
        </header>

        <div className="space-y-4">
          {mockGoals.map((g) => (
            <SoftCard key={g.id} padding="md">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{g.title}</span>
                <span className="font-tabular text-caption text-muted-foreground">
                  {Math.round(g.progress * 100)}%
                </span>
              </div>
              <div
                className="h-3 w-full overflow-hidden rounded-full bg-surface-sunken"
                role="progressbar"
                aria-valuenow={Math.round(g.progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${g.title} progress`}
              >
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.round(g.progress * 100)}%` }}
                />
              </div>
            </SoftCard>
          ))}
        </div>
      </div>
    </ScreenSurface>
  );
}
