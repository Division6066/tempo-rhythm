/**
 * @screen: empty-states
 * @category: You
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @queries: none
 * @mutations: none
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { mockEmptyStateExamples } from "@tempo/mock-data";
import { Button, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>("ready");

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-3xl space-y-8 p-6 pb-24 md:p-8">
        <header>
          <p className="font-eyebrow text-muted-foreground">Empty states</p>
          <h1 className="text-h1 font-serif text-foreground">Quiet rooms.</h1>
        </header>
        <div className="space-y-4">
          {mockEmptyStateExamples.map((e) => (
            <SoftCard key={e.title} tone="sunken" padding="lg">
              <h2 className="text-h3 font-serif text-foreground">{e.title}</h2>
              <p className="mt-2 text-body text-muted-foreground">{e.body}</p>
              <Button
                type="button"
                variant="primary"
                className="mt-4"
                onClick={() => router.push(e.title.includes("task") ? "/tasks" : "/notes")}
              >
                {e.cta}
              </Button>
            </SoftCard>
          ))}
        </div>
      </div>
    </ScreenSurface>
  );
}
