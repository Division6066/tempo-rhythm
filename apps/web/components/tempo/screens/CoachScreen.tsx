"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, CoachBubble, Pill, SoftCard } from "@tempo/ui/primitives";
import {
  mockCoachScreen,
  mockCoachThread,
  mockUser,
  type MockCoachMessage,
} from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

/**
 * CoachScreen — persistent coach conversation.
 * @source docs/design/claude-export/design-system/screens-1.jsx (ScreenCoach)
 * @source docs/design/claude-export/design-system/coach-dock.jsx
 */
export function CoachScreen() {
  const router = useRouter();
  const toast = useDemoToast();
  const [thread, setThread] = useState<MockCoachMessage[]>(mockCoachThread);
  const [draft, setDraft] = useState("");
  const [warmth, setWarmth] = useState(mockUser.coachDial);

  const voiceCapByTier = useMemo(
    () => ({ basic: 30, pro: 90, max: 180 }) as const,
    [],
  );
  const voiceCap = voiceCapByTier[mockUser.tier];

  const send = (content: string) => {
    if (!content.trim()) return;
    const userTurn: MockCoachMessage = {
      id: `coach_u_${Date.now()}`,
      role: "user",
      content: content.trim(),
      createdAtLabel: "just now",
    };
    const assistantTurn: MockCoachMessage = {
      id: `coach_a_${Date.now() + 1}`,
      role: "assistant",
      content:
        "Okay. This is a frontend-only demo response — the backend run will stream a real answer here via coach.sendMessage.",
      createdAtLabel: "just now",
    };
    setThread((prev) => [...prev, userTurn, assistantTurn]);
    setDraft("");
    toast("Sent. (demo) coach.sendMessage would stream a reply.");
  };

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Coach"
        title="A quiet second brain."
        lede={
          <>
            Warmth dial at <strong>{warmth}/10</strong> — gently offering, not
            saccharine. Coach sees only the notes and projects you share.
          </>
        }
        right={
          <div className="flex items-center gap-3">
            <Pill tone="moss">Online</Pill>
            <Pill tone="neutral">
              Voice {mockUser.voiceMinutesUsedToday}/{voiceCap}m
            </Pill>
          </div>
        }
      />

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SoftCard tone="default" padding="none">
          <div className="flex items-center gap-3 border-b border-border-soft px-5 py-3">
            <div className="tempo-gradient-bg flex h-9 w-9 items-center justify-center rounded-full text-small font-semibold text-white">
              T
            </div>
            <div className="flex-1">
              <div className="text-small font-medium">Tempo Coach</div>
              <div className="text-caption text-muted-foreground">
                scope · 2 notes · 1 project
              </div>
            </div>
          </div>

          <div className="flex min-h-[480px] flex-col gap-3 p-5">
            {thread.map((m) => (
              <CoachBubble
                key={m.id}
                speaker={m.role === "assistant" ? "coach" : "user"}
                timestamp={m.createdAtLabel}
                actions={
                  m.role === "assistant" ? (
                    <>
                      {/*
                       * @behavior: Accept the coach's proposal into today's plan.
                       * @convex-mutation-needed: coach.acceptSuggestion
                       * @confirm: accept / edit / reject
                       */}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => toast("Accepted. (demo) coach.acceptSuggestion.")}
                      >
                        Accept
                      </Button>
                      {/*
                       * @behavior: Tweak the proposal via a short follow-up prompt.
                       * @convex-action-needed: coach.requestRevision
                       * @provider-needed: openrouter
                       */}
                      <Button
                        variant="soft"
                        size="sm"
                        onClick={() => toast("Tweak requested. (demo) coach.requestRevision.")}
                      >
                        Tweak
                      </Button>
                      {/*
                       * @behavior: Skip this suggestion; it is discarded, never stored.
                       * @convex-mutation-needed: coach.dismissSuggestion
                       */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast("Skipped. (demo)")}
                      >
                        Skip
                      </Button>
                    </>
                  ) : undefined
                }
              >
                {m.content}
              </CoachBubble>
            ))}
          </div>

          <div className="border-t border-border-soft p-4">
            <div className="mb-2 flex flex-wrap gap-2">
              {mockCoachScreen.suggestedPrompts.map((prompt) => (
                /*
                 * @behavior: Send a one-tap suggested prompt into the coach thread.
                 * @convex-action-needed: coach.sendMessage
                 * @provider-needed: openrouter
                 */
                <Button
                  key={prompt}
                  variant="subtle"
                  size="sm"
                  onClick={() => send(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>

            <div className="flex items-end gap-2">
              {/*
               * @behavior: Hold-to-talk; release to transcribe and insert into composer (not sent yet).
               * @convex-action-needed: voice.transcribePushToTalk
               * @provider-needed: openrouter
               * @schema-delta: voiceSessions.mode
               * @tier-caps: basic 30 min/day, pro 90 min/day, max 180 min/day
               */}
              <Button
                variant="primary"
                size="md"
                onClick={() => toast("Held mic. (demo) voice.transcribePushToTalk.")}
                aria-label="Push to talk"
              >
                🎤
              </Button>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(draft);
                  }
                }}
                rows={2}
                placeholder="Type or dictate… (Enter to send)"
                className="flex-1 resize-none rounded-lg border border-border-soft bg-surface-sunken px-3 py-2 text-body focus:border-primary focus:outline-none"
              />
              {/*
               * @behavior: Send text turn; stream assistant response back into thread.
               * @convex-action-needed: coach.sendMessage
               * @provider-needed: openrouter
               * @streaming: token stream via action
               */}
              <Button
                variant="inverse"
                size="md"
                onClick={() => send(draft)}
                disabled={!draft.trim()}
              >
                Send
              </Button>
            </div>
          </div>
        </SoftCard>

        <div className="flex flex-col gap-5">
          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow mb-2">Warmth</div>
            <p className="text-small text-muted-foreground">
              Slide between crisp and gentle. Coach adjusts tone each turn.
            </p>
            <input
              type="range"
              min={0}
              max={10}
              value={warmth}
              onChange={(e) => setWarmth(Number(e.target.value))}
              className="mt-3 w-full accent-primary"
              /*
               * @behavior: Persist warmth preference per user (0-10).
               * @convex-mutation-needed: profiles.setCoachDial
               * @schema-delta: profiles.coachDial
               */
            />
            <div className="flex items-center justify-between text-caption text-muted-foreground">
              <span>Crisp</span>
              <span className="font-tabular">{warmth}/10</span>
              <span>Gentle</span>
            </div>
          </SoftCard>

          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow mb-2">Scope</div>
            <ul className="flex flex-col gap-2 text-small text-muted-foreground">
              <li>📓 Launch copy scratchpad</li>
              <li>📓 Convex auth notes</li>
              <li>🗂 Tempo Flow project</li>
            </ul>
            {/*
             * @behavior: Open a picker to add/remove notes/projects from coach scope.
             * @navigate: /settings/preferences
             */}
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => router.push("/settings/preferences")}
            >
              Manage scope →
            </Button>
          </SoftCard>

          <SoftCard tone="sunken" padding="md">
            <div className="font-eyebrow mb-2">Privacy</div>
            <p className="text-small text-muted-foreground">
              Coach never reads your full library. Only the notes and projects
              you explicitly share are attached to a conversation.
            </p>
          </SoftCard>
        </div>
      </div>
    </div>
  );
}
