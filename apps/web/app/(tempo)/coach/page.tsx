/**
 * @screen: coach
 * @category: Flow
 * @source: docs/design/claude-export/design-system/screens-1.jsx:L207-L299
 * @queries:
 *   - conversations.listByUser withIndex("by_userId_deletedAt")
 *   - messages.listByConversation withIndex("by_conversationId_createdAt")
 * @mutations:
 *   - messages.appendUser / messages.appendAssistant (insert into messages)
 *   - conversations.updateTitle
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL, NEXT_PUBLIC_POSTHOG_KEY (opt-in @analytics: coach_message_sent)
 */
"use client";

import { useState } from "react";
import {
  mockCoachMessages,
  mockCoachPastThreads,
  mockCoachPersonalityLabel,
  mockCoachQuickPills,
  mockCoachScopeItems,
  mockCoachScopeSummary,
  mockCoachWarmthLevel,
} from "@tempo/mock-data";
import { Button, CoachBubble, Pill, SoftCard } from "@tempo/ui/primitives";
import { Folder, Mic, Notebook, Plus, Send, Volume } from "@tempo/ui/icons";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");
  const [draft, setDraft] = useState("");

  const dialPct = Math.min(100, Math.max(0, (mockCoachWarmthLevel / 10) * 100));

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-6xl space-y-8 p-6 pb-24 md:p-8">
        <header className="space-y-2">
          <p className="font-eyebrow text-muted-foreground">Coach</p>
          <h1 className="text-h1 font-serif text-foreground">A quiet second brain.</h1>
          <p className="max-w-2xl text-body leading-relaxed text-muted-foreground">
            Warmth dial at <strong>{mockCoachWarmthLevel}/10</strong> — gently offering, not saccharine. Coach sees
            only the notes and projects you share.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <SoftCard padding="none" className="flex min-h-[560px] flex-col overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-5 py-3">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-serif text-[13px] font-semibold text-primary-foreground"
                aria-hidden
              >
                T
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-small font-medium text-foreground">Tempo Coach</div>
                <div className="text-caption text-muted-foreground">{mockCoachScopeSummary}</div>
              </div>
              <Pill tone="moss">Online</Pill>
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
              <p className="text-center text-caption text-muted-foreground">Thursday, 9:12 AM</p>
              {mockCoachMessages.map((m) => {
                const bubble =
                  m.role === "user" ? (
                    <CoachBubble key={m.id} bubbleRole="user">
                      {m.body}
                    </CoachBubble>
                  ) : (
                    <CoachBubble key={m.id} bubbleRole="coach">
                      {m.body}
                    </CoachBubble>
                  );
                return bubble;
              })}
            </div>

            <div className="border-t border-border p-4 sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <label htmlFor="coach-input" className="sr-only">
                  Message coach
                </label>
                <textarea
                  id="coach-input"
                  placeholder="Type, or hold to dictate…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  className="min-h-[44px] flex-1 resize-none rounded-lg border border-border bg-card px-3 py-2 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {/*
                  @action openWalkieTalkie
                  @action-call: voice.openSession({ mode: walkie })
                  @auth: required
                  @errors: toast
                  @env: NEXT_PUBLIC_CONVEX_URL
                  @source: screens-1.jsx:L250
                */}
                <Button type="button" variant="ghost" size="sm" aria-label="Walkie-talkie — hold to speak" title="Walkie-talkie — hold to speak">
                  <Mic size={18} />
                </Button>
                {/*
                  @action openVoiceMode
                  @action-call: voice.openSession({ mode: hands_free })
                  @auth: required
                  @errors: toast
                  @env: NEXT_PUBLIC_CONVEX_URL
                  @source: screens-1.jsx:L251 — inline style in export; using Tailwind orange tint instead
                */}
                <Button type="button" variant="soft" size="sm" className="border-orange-500/35 text-primary" aria-label="Voice mode — hands-free" title="Voice mode — hands-free">
                  <Volume size={18} />
                </Button>
                {/*
                  @action sendCoachMessage
                  @mutation: messages.appendUser + internalAction coach.replyStream
                  @index: by_conversationId_createdAt
                  @streaming: token stream via action (OpenRouter via fetch in Convex action)
                  @auth: required
                  @errors: toast
                  @env: NEXT_PUBLIC_CONVEX_URL
                  @source: screens-1.jsx:L252
                */}
                <Button type="button" variant="primary" size="md" leadingIcon={<Send size={14} />}>
                  Send
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {mockCoachQuickPills.map((p) => (
                  <Pill key={p} tone="neutral">
                    {p}
                  </Pill>
                ))}
              </div>
            </div>
          </SoftCard>

          <aside className="space-y-6">
            <SoftCard padding="md">
              <p className="mb-2 font-eyebrow text-muted-foreground">Personality dial</p>
              <p className="mb-3 font-serif text-xl text-foreground">{mockCoachPersonalityLabel}</p>
              <div className="relative h-2 rounded-full bg-surface-sunken" role="img" aria-label={`Coach warmth ${mockCoachWarmthLevel} of 10`}>
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary"
                  style={{ width: `${dialPct}%` }}
                />
                <div
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-card shadow-whisper"
                  style={{ left: `${dialPct}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-caption text-muted-foreground">
                <span>softer</span>
                <span>sharper</span>
              </div>
            </SoftCard>

            <SoftCard padding="md">
              <p className="mb-3 font-eyebrow text-muted-foreground">Conversation scope</p>
              <ul className="space-y-2">
                {mockCoachScopeItems.map((item) => (
                  <li key={item.title} className="flex items-center gap-2 text-small text-foreground">
                    {item.kind === "project" ? (
                      <Folder size={14} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
                    ) : (
                      <Notebook size={14} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
                    )}
                    <span>{item.title}</span>
                  </li>
                ))}
              </ul>
              {/*
                @action addScopeItem
                @mutation: coach.addScopeNoteId (Long Run 2; @todo: requires schema add coachScope)
                @auth: required
                @errors: toast
                @env: NEXT_PUBLIC_CONVEX_URL
                @source: screens-1.jsx:L282
              */}
              <Button type="button" variant="soft" size="sm" className="mt-3" leadingIcon={<Plus size={12} />}>
                Add to scope
              </Button>
            </SoftCard>

            <SoftCard tone="sunken" padding="md">
              <p className="mb-2 font-eyebrow text-muted-foreground">Past conversations</p>
              <ul className="space-y-1">
                {mockCoachPastThreads.map((t) => (
                  <li key={t} className="font-serif text-small text-muted-foreground">
                    {t}
                  </li>
                ))}
              </ul>
            </SoftCard>
          </aside>
        </div>
      </div>
    </ScreenSurface>
  );
}
