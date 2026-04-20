/**
 * @screen: settings-integrations
 * @category: Settings
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @queries: integrations.listConnected (Long Run 2)
 * @mutations: integrations.connect / disconnect (Long Run 2)
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useState } from "react";
import { Button, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

const rows = [
  { id: "cal", name: "Calendar sync", status: "Not connected" },
  { id: "mail", name: "Email capture", status: "Coming soon" },
] as const;

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-xl space-y-8 p-6 pb-24 md:p-8">
        <header>
          <p className="font-eyebrow text-muted-foreground">Settings</p>
          <h1 className="text-h1 font-serif text-foreground">Integrations</h1>
          <p className="mt-2 text-body text-muted-foreground">Connect tools gently. Nothing auto-posts without you.</p>
        </header>
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <SoftCard padding="md" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">{r.name}</p>
                  <p className="text-caption text-muted-foreground">{r.status}</p>
                </div>
                {/*
                  @action connectIntegration
                  @mutation: integrations.oauthStart (Long Run 2)
                  @auth: required
                  @errors: toast
                  @env: NEXT_PUBLIC_CONVEX_URL
                */}
                <Button type="button" variant="soft" size="sm" disabled={r.id === "mail"}>
                  Connect
                </Button>
              </SoftCard>
            </li>
          ))}
        </ul>
      </div>
    </ScreenSurface>
  );
}
