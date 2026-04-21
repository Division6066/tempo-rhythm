"use client";

import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

const PROVIDERS = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    connected: false,
    tag: "calendar",
    description: "Pull events + quiet slots into today's plan.",
  },
  {
    id: "apple-calendar",
    name: "Apple Calendar (iCal)",
    connected: false,
    tag: "calendar",
    description: "Read-only iCal feed.",
  },
  {
    id: "notion",
    name: "Notion",
    connected: false,
    tag: "notes",
    description: "One-way import of databases into Notes.",
  },
  {
    id: "whatsapp",
    name: "WhatsApp export",
    connected: false,
    tag: "capture",
    description: "RAM-only scan of a chat export to extract tasks.",
  },
  {
    id: "telegram",
    name: "Telegram export",
    connected: false,
    tag: "capture",
    description: "RAM-only scan.",
  },
  {
    id: "chatgpt",
    name: "ChatGPT export",
    connected: false,
    tag: "capture",
    description: "RAM-only scan of a conversation export.",
  },
];

/**
 * SettingsIntegrationsScreen — connect calendars and RAM-only capture imports.
 * @source docs/design/claude-export/design-system/screens-6.jsx
 */
export function SettingsIntegrationsScreen() {
  const toast = useDemoToast();

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Settings"
        title="Integrations"
        lede="Calendars are read-only. Capture imports are scanned in memory — nothing persists raw."
      />

      <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
        {PROVIDERS.map((provider) => (
          <SoftCard key={provider.id} tone="default" padding="md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="font-eyebrow">{provider.tag}</div>
                <h3 className="font-serif text-h4">{provider.name}</h3>
                <p className="text-small text-muted-foreground">
                  {provider.description}
                </p>
              </div>
              <Pill tone={provider.connected ? "moss" : "neutral"}>
                {provider.connected ? "connected" : "off"}
              </Pill>
            </div>
            <div className="mt-4 flex gap-2">
              {/*
               * @behavior: Connect to third-party via OAuth or upload (RAM-only for scanners).
               * @convex-action-needed: integrations.connect
               * @provider-needed: google-calendar | notion | apple-calendar
               */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => toast(`${provider.name}. (demo) integrations.connect.`)}
              >
                Connect
              </Button>
              {/*
               * @behavior: Revoke stored tokens and forget the integration.
               * @convex-mutation-needed: integrations.revoke
               */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast("Revoked. (demo) integrations.revoke.")}
              >
                Revoke
              </Button>
            </div>
          </SoftCard>
        ))}
      </div>
    </div>
  );
}
