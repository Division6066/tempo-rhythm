/**
 * @screen: template-sketch
 * @category: You
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 * @queries: none
 * @mutations: templates.saveSketchRaster (Long Run 2; optional)
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>("ready");

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-4xl space-y-6 p-6 pb-24 md:p-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="font-eyebrow text-muted-foreground">Sketch</p>
            <h1 className="text-h1 font-serif text-foreground">Freehand before structure.</h1>
          </div>
          <Button type="button" variant="ghost" onClick={() => router.push("/templates")}>
            Done
          </Button>
        </header>
        <SoftCard padding="none" className="aspect-[4/3] w-full bg-surface-sunken">
          <div className="flex h-full min-h-[320px] items-center justify-center p-8">
            <p className="max-w-sm text-center text-body text-muted-foreground">
              Drawing surface placeholder — wire to canvas or export PNG in Long Run 2.
            </p>
          </div>
        </SoftCard>
      </div>
    </ScreenSurface>
  );
}
