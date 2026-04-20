/**
 * @screen: activity
 * @category: You
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 * @queries: auditEvents.listRecent (Long Run 2; @todo: requires schema add auditEvents)
 * @mutations: none
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useState } from "react";
import { mockActivityLines } from "@tempo/mock-data";
import { SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-3xl space-y-8 p-6 pb-24 md:p-8">
        <header>
          <p className="font-eyebrow text-muted-foreground">Recent activity</p>
          <h1 className="text-h1 font-serif text-foreground">What changed recently.</h1>
        </header>
        <SoftCard padding="none" className="divide-y divide-border-soft">
          {mockActivityLines.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <p className="text-small text-foreground">{a.text}</p>
              <span className="shrink-0 font-tabular text-caption text-muted-foreground">{a.at}</span>
            </div>
          ))}
        </SoftCard>
      </div>
    </ScreenSurface>
  );
}
