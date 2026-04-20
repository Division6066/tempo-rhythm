/**
 * @screen: trial-end
 * @category: Settings
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @queries: billing.getSubscriptionState
 * @mutations: billing.openCheckout
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL, POLAR_ACCESS_TOKEN
 */
"use client";

import { useState } from "react";
import { Button, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-lg space-y-8 p-6 pb-24 md:p-8">
        <header>
          <p className="font-eyebrow text-muted-foreground">Trial</p>
          <h1 className="text-h1 font-serif text-foreground">Your walk paused here.</h1>
          <p className="mt-2 text-body text-muted-foreground">
            No shame — pick up when you are ready, or keep a lighter free tier.
          </p>
        </header>
        <SoftCard padding="md" className="space-y-4">
          {/*
            @action resumeSubscription
            @mutation: billing.resume (Long Run 2)
            @auth: required
            @errors: toast
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button type="button" variant="primary" className="w-full">
            Continue with Plus
          </Button>
          {/*
            @action downgradeToFree
            @mutation: billing.setPlanFree
            @confirm: undoable 5s
            @auth: required
            @errors: toast
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button type="button" variant="ghost" className="w-full">
            Stay on free
          </Button>
        </SoftCard>
      </div>
    </ScreenSurface>
  );
}
