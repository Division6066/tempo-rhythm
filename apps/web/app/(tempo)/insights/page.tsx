/**
 * @screen: insights
 * @category: You
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 * @queries: analytics.summary7d (Long Run 2; @todo: requires schema add analyticsEvents)
 * @mutations: none
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL, NEXT_PUBLIC_POSTHOG_KEY (opt-in only)
 */
"use client";

import { useState } from "react";
import { mockInsightStats } from "@tempo/mock-data";
import { SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-4xl space-y-8 p-6 pb-24 md:p-8">
        <header>
          <p className="font-eyebrow text-muted-foreground">Insights</p>
          <h1 className="text-h1 font-serif text-foreground">Patterns, not scores.</h1>
          <p className="mt-2 text-body text-muted-foreground">
            Mock snapshot — Long Run 2 aggregates from Convex with PostHog opt-in only.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-3">
          {mockInsightStats.map((s) => (
            <SoftCard key={s.label} padding="md">
              <p className="text-caption text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-serif text-3xl text-foreground">{s.value}</p>
              <p className="mt-1 text-small text-muted-foreground">{s.delta}</p>
            </SoftCard>
          ))}
        </div>
      </div>
    </ScreenSurface>
  );
}
