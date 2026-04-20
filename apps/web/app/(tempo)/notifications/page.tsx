/**
 * @screen: notifications
 * @category: Settings
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @queries: notifications.listByUser (Long Run 2; @todo: requires schema add notifications)
 * @mutations: notifications.markRead
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useState } from "react";
import { mockNotificationItems } from "@tempo/mock-data";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-xl space-y-8 p-6 pb-24 md:p-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-eyebrow text-muted-foreground">Notifications</p>
            <h1 className="text-h1 font-serif text-foreground">Gentle pings only.</h1>
          </div>
          {/*
            @action markAllNotificationsRead
            @mutation: notifications.markAllRead (Long Run 2)
            @auth: required
            @errors: toast
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button type="button" variant="soft" size="sm">
            Mark all read
          </Button>
        </header>
        <ul className="space-y-3">
          {mockNotificationItems.map((n) => (
            <li key={n.id}>
              <SoftCard padding="md" className={n.unread ? "border-primary/30" : ""}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{n.title}</p>
                    <p className="mt-1 text-small text-muted-foreground">{n.body}</p>
                  </div>
                  {n.unread ? <Pill tone="orange">New</Pill> : null}
                </div>
              </SoftCard>
            </li>
          ))}
        </ul>
      </div>
    </ScreenSurface>
  );
}
