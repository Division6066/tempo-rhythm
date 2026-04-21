"use client";

import { useState } from "react";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

type Notif = {
  id: string;
  type: "coach" | "habit" | "system" | "founder";
  title: string;
  body: string;
  when: string;
  read: boolean;
};

const SEED: Notif[] = [
  {
    id: "n1",
    type: "coach",
    title: "Coach staged tomorrow morning",
    body: "Three anchors ready. Tap to review.",
    when: "2m ago",
    read: false,
  },
  {
    id: "n2",
    type: "habit",
    title: "Morning walk is due",
    body: "No pressure — just a nudge.",
    when: "30m ago",
    read: false,
  },
  {
    id: "n3",
    type: "system",
    title: "Voice minutes: 75% used",
    body: "You've used 67/90 min of your daily Pro cap.",
    when: "1h ago",
    read: true,
  },
  {
    id: "n4",
    type: "founder",
    title: "Reply from the founder",
    body: "Thanks for the report — fix lands tonight.",
    when: "yesterday",
    read: true,
  },
];

const TONE: Record<Notif["type"], "orange" | "moss" | "slate" | "neutral"> = {
  coach: "orange",
  habit: "moss",
  system: "slate",
  founder: "neutral",
};

/**
 * NotificationsScreen — notification center.
 * @source docs/design/claude-export/design-system/screens-6.jsx (ScreenNotifications)
 */
export function NotificationsScreen() {
  const toast = useDemoToast();
  const [items, setItems] = useState(SEED);

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Settings"
        title="Notifications"
        lede="Everything Tempo has surfaced. No marketing here."
        right={
          <>
            {/*
             * @behavior: Mark all as read.
             * @convex-mutation-needed: notifications.markAllRead
             */}
            <Button
              variant="soft"
              size="sm"
              onClick={() => {
                setItems((prev) => prev.map((n) => ({ ...n, read: true })));
                toast("All read. (demo) notifications.markAllRead.");
              }}
            >
              Mark all read
            </Button>
          </>
        }
      />

      <div className="px-6 py-6">
        <SoftCard tone="default" padding="md">
          <ul className="flex flex-col divide-y divide-border-soft">
            {items.map((n) => (
              <li
                key={n.id}
                className={[
                  "flex items-start justify-between gap-3 py-3",
                  n.read ? "opacity-70" : "",
                ].join(" ")}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Pill tone={TONE[n.type]}>{n.type}</Pill>
                    <span className="font-tabular text-caption text-muted-foreground">
                      {n.when}
                    </span>
                    {!n.read ? (
                      <span aria-hidden className="h-2 w-2 rounded-full bg-primary" />
                    ) : null}
                  </div>
                  <div className="text-body">{n.title}</div>
                  <div className="text-small text-muted-foreground">{n.body}</div>
                </div>
                {/*
                 * @behavior: Dismiss a single notification.
                 * @convex-mutation-needed: notifications.dismiss
                 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setItems((prev) => prev.filter((it) => it.id !== n.id))
                  }
                  aria-label={`Dismiss ${n.title}`}
                >
                  ×
                </Button>
              </li>
            ))}
            {items.length === 0 ? (
              <li className="py-12 text-center text-small text-muted-foreground">
                Nothing new. Close the tab and take a breath.
              </li>
            ) : null}
          </ul>
        </SoftCard>
      </div>
    </div>
  );
}
