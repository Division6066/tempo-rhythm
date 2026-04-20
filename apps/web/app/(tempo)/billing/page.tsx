/**
 * @screen: billing
 * @category: Settings
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @queries: billing.getSubscriptionState (Long Run 2; RevenueCat webhook → Convex)
 * @mutations: billing.openCheckout (Polar server route; POLAR_ACCESS_TOKEN server-only on Vercel)
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL, POLAR_ACCESS_TOKEN (server), NEXT_PUBLIC_POLAR_MONTHLY_PRODUCT_ID
 */
"use client";

import { useState } from "react";
import { mockBillingCopy, mockUser } from "@tempo/mock-data";
import { Button, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-xl space-y-8 p-6 pb-24 md:p-8">
        <header>
          <p className="font-eyebrow text-muted-foreground">Billing</p>
          <h1 className="text-h1 font-serif text-foreground">{mockBillingCopy.headline}</h1>
          <p className="mt-2 text-body text-muted-foreground">{mockBillingCopy.lede}</p>
        </header>
        <SoftCard padding="md" className="space-y-3">
          <p className="text-small text-muted-foreground">
            Trial day {mockBillingCopy.trialDay} of {mockBillingCopy.trialTotalDays} · {mockBillingCopy.daysLeft}{" "}
            days left
          </p>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken"
            role="progressbar"
            aria-valuenow={mockBillingCopy.progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full bg-primary" style={{ width: `${mockBillingCopy.progressPct}%` }} />
          </div>
          <p className="text-caption text-muted-foreground">
            Logged in as {mockUser.email} · plan flag (mock): {mockUser.isPremium ? "Plus" : "Free"}
          </p>
          {/*
            @action openPolarCheckout
            @mutation: none (redirect to Polar checkout via Next route; server uses POLAR_ACCESS_TOKEN)
            @auth: required
            @errors: toast
            @env: POLAR_ACCESS_TOKEN, NEXT_PUBLIC_POLAR_MONTHLY_PRODUCT_ID
          */}
          <Button type="button" variant="primary">
            Continue with Tempo Plus
          </Button>
        </SoftCard>
      </div>
    </ScreenSurface>
  );
}
