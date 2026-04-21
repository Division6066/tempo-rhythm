"use client";

import { useState } from "react";
import { Button, SoftCard } from "@tempo/ui/primitives";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

/**
 * AskFounderScreen — direct line to the founder for early users.
 * @source docs/design/claude-export/design-system/screens-6.jsx (ScreenAskFounder)
 */
export function AskFounderScreen() {
  const toast = useDemoToast();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Settings"
        title="Ask the founder"
        lede="Questions, frustrations, or tiny wins. I read every message."
      />

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SoftCard tone="default" padding="md">
          <label className="flex flex-col gap-1 text-small">
            <span className="font-eyebrow">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="One-line headline"
              className="rounded-lg border border-border-soft bg-surface-sunken px-3 py-2 focus:border-primary focus:outline-none"
              /*
               * @behavior: Carry subject into the founder inbox email/record.
               * @convex-mutation-needed: founderInbox.createDraft
               */
            />
          </label>
          <label className="mt-4 flex flex-col gap-1 text-small">
            <span className="font-eyebrow">Message</span>
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Whatever it is. No formatting needed."
              className="rounded-lg border border-border-soft bg-surface-sunken p-3 font-serif text-body focus:border-primary focus:outline-none"
              /*
               * @behavior: Save draft; debounced persist so nothing is lost.
               * @convex-mutation-needed: founderInbox.updateDraft
               */
            />
          </label>
          <div className="mt-4 flex items-center justify-end gap-2">
            {/*
             * @behavior: Send message to founder inbox (RAM-only intermediate → persisted record).
             * @convex-action-needed: founderInbox.sendMessage
             * @confirm: undoable 10s
             */}
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                toast("Sent. (demo) founderInbox.sendMessage.");
                setSubject("");
                setBody("");
              }}
            >
              Send
            </Button>
          </div>
        </SoftCard>

        <SoftCard tone="sunken" padding="md">
          <div className="font-eyebrow mb-2">What happens next</div>
          <p className="text-small text-muted-foreground">
            Messages land in a Convex inbox only I see. Typical reply: within 48 hours on weekdays.
          </p>
          <p className="mt-3 text-small text-muted-foreground">
            For urgent bugs, <a href="/settings/integrations" className="underline-offset-4 hover:underline">connect Sentry</a> from Integrations so I can triage faster.
          </p>
        </SoftCard>
      </div>
    </div>
  );
}
