/**
 * @screen: ask-founder
 * @category: Settings
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @queries: none
 * @mutations: feedback.submitToFounder (Long Run 2; @todo: requires schema add feedback)
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useState } from "react";
import { Button, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");
  const [message, setMessage] = useState("");

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-xl space-y-8 p-6 pb-24 md:p-8">
        <header>
          <p className="font-eyebrow text-muted-foreground">Ask the founder</p>
          <h1 className="text-h1 font-serif text-foreground">One honest note.</h1>
        </header>
        <SoftCard padding="md">
          <label htmlFor="founder-msg" className="sr-only">
            Message
          </label>
          <textarea
            id="founder-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            placeholder="What would make Tempo kinder for your Tuesdays?"
            className="w-full resize-y rounded-lg border border-border bg-transparent p-3 font-serif text-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {/*
            @action sendFounderMessage
            @mutation: feedback.submit ({ body }) (Long Run 2)
            @auth: required
            @errors: toast
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button type="button" variant="primary" className="mt-4">
            Send
          </Button>
        </SoftCard>
      </div>
    </ScreenSurface>
  );
}
