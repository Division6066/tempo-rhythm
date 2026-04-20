/**
 * @screen: command
 * @category: You
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 * @queries: commandPalette.recent (Long Run 2)
 * @mutations: none
 * @navigate: per row
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { mockCommandActions } from "@tempo/mock-data";
import { Button, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>("ready");

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-lg space-y-6 p-6 pb-24 md:p-8">
        <header>
          <p className="font-eyebrow text-muted-foreground">Command bar</p>
          <h1 className="text-h1 font-serif text-foreground">Jump anywhere.</h1>
        </header>
        <SoftCard padding="md" className="space-y-2">
          {mockCommandActions.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-surface-sunken">
              <span className="text-small text-foreground">{a.label}</span>
              <span className="font-mono text-caption text-muted-foreground">{a.shortcut}</span>
            </div>
          ))}
        </SoftCard>
        <p className="text-caption text-muted-foreground">
          Full palette lives in shell (⌘K) — this route mirrors quick actions for deep links.
        </p>
        {/*
          @action commandGoToday
          @navigate: /today
          @auth: required
          @env: NEXT_PUBLIC_CONVEX_URL
        */}
        <Button type="button" variant="primary" onClick={() => router.push("/today")}>
          Go to Today
        </Button>
      </div>
    </ScreenSurface>
  );
}
