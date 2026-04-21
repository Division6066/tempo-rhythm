"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

const INITIAL_DUMP =
  "Remember to finish the landing copy. Book dentist. Ask Sam about the Convex migration. Pick up groceries on the way home. Worry: am I shipping fast enough? Idea: use the orange gradient on the first-run splash. Journal later about the talk.";

type ExtractedType = "task" | "reminder" | "idea" | "worry" | "note";
type Extracted = {
  id: string;
  text: string;
  type: ExtractedType;
  confidence: number;
};

const INITIAL_ITEMS: Extracted[] = [
  { id: "x1", text: "Finish the landing copy", type: "task", confidence: 0.94 },
  { id: "x2", text: "Book dentist", type: "task", confidence: 0.97 },
  { id: "x3", text: "Ask Sam about the Convex migration", type: "task", confidence: 0.91 },
  { id: "x4", text: "Pick up groceries on the way home", type: "reminder", confidence: 0.86 },
  { id: "x5", text: "Am I shipping fast enough?", type: "worry", confidence: 0.88 },
  { id: "x6", text: "Orange gradient on the first-run splash", type: "idea", confidence: 0.82 },
  { id: "x7", text: "Journal about the talk", type: "reminder", confidence: 0.79 },
];

const toneFor: Record<ExtractedType, "orange" | "slate" | "moss" | "amber" | "neutral"> = {
  task: "orange",
  reminder: "slate",
  idea: "moss",
  worry: "amber",
  note: "neutral",
};

/**
 * BrainDumpScreen — low-friction capture + review.
 *
 * @source docs/design/claude-export/design-system/screens-1.jsx (ScreenBrainDump)
 */
export function BrainDumpScreen() {
  const router = useRouter();
  const toast = useDemoToast();
  const [text, setText] = useState(INITIAL_DUMP);
  const [processed, setProcessed] = useState(true);
  const [items, setItems] = useState<Extracted[]>(INITIAL_ITEMS);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Brain Dump"
        title="Everything on your mind."
        lede="Don't organize it. Just type. I'll sort it into tasks, reminders, ideas, and worries — then you approve what sticks."
      />

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SoftCard tone="default" padding="md">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-h4 font-serif">Dump</h3>
            <div className="flex items-center gap-3">
              {/*
               * @behavior: Start voice dictation; transcript streams into textarea.
               * @convex-action-needed: voice.transcribeWalkieTalkie
               * @provider-needed: openrouter
               * @tier-caps: basic 30 min/day, pro 90 min/day, max 180 min/day
               * @schema-delta: voiceSessions.mode
               */}
              <Button
                variant="soft"
                size="sm"
                onClick={() => toast("Dictate held. (demo) voice.transcribeWalkieTalkie.")}
                aria-label="Dictate"
              >
                🎤 Dictate
              </Button>
              <span className="font-tabular text-caption text-muted-foreground">
                {text.length} chars · {wordCount} words
              </span>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[280px] w-full resize-y rounded-lg border border-border-soft bg-surface-sunken p-4 font-serif text-h4 leading-relaxed text-foreground focus:border-primary focus:outline-none"
            /*
             * @behavior: Hold raw dump text in RAM only; never persisted raw, per HARD_RULES §3.
             * @convex-action-needed: brainDumps.processCapture (on Sort-it)
             * @provider-needed: openrouter
             */
          />

          <div className="mt-4 flex items-center justify-between">
            <span className="text-caption text-muted-foreground">
              End-to-end encrypted. Only you see this.
            </span>
            {/*
             * @behavior: Send dump to the extraction pipeline; returns typed items with confidences.
             * @convex-action-needed: brainDumps.processCapture
             * @provider-needed: openrouter
             * @schema-delta: brainDumps.processingStatus
             */}
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setProcessed(true);
                toast("Sorted. (demo) brainDumps.processCapture → proposals ready.");
              }}
            >
              ✨ Sort it
            </Button>
          </div>
        </SoftCard>

        <div className="flex flex-col gap-5">
          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow mb-2">Gentle prompts</div>
            <div className="flex flex-col gap-2">
              {[
                "What's one thing you've been avoiding?",
                "Any small wins from yesterday?",
                "What would help your shoulders drop?",
              ].map((q) => (
                /*
                 * @behavior: Append this prompt above the current cursor position in the textarea.
                 * @source: docs/design/claude-export/design-system/screens-1.jsx
                 */
                <button
                  key={q}
                  type="button"
                  className="rounded-lg bg-surface-sunken p-3 text-left font-serif text-small text-foreground transition-colors hover:bg-surface"
                  onClick={() => setText((prev) => `${q}\n\n${prev}`)}
                >
                  {q}
                </button>
              ))}
            </div>
          </SoftCard>

          <SoftCard tone="sunken" padding="md">
            <div className="font-eyebrow mb-2">Privacy</div>
            <p className="text-small text-muted-foreground">
              Raw dumps never leave memory until you approve a sorted item.
              Convex stores only the proposals you accept.
            </p>
          </SoftCard>
        </div>
      </div>

      {processed ? (
        <div className="px-6 pb-10">
          <SoftCard tone="default" padding="md">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-eyebrow">Sorted — {items.length} items</div>
                <h3 className="text-h4 font-serif">Review and approve</h3>
              </div>
              <div className="flex items-center gap-2">
                {/*
                 * @behavior: Accept every extracted proposal at once; writes all to library.
                 * @convex-mutation-needed: brainDumps.acceptAllProposals
                 * @confirm: undoable 10s
                 */}
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => {
                    setItems([]);
                    toast("Accepted all. (demo) brainDumps.acceptAllProposals.");
                  }}
                >
                  Approve all
                </Button>
                {/*
                 * @behavior: Discard all proposals; nothing is written.
                 * @convex-mutation-needed: brainDumps.discardProposals
                 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setItems([]);
                    toast("Skipped all. (demo) brainDumps.discardProposals.");
                  }}
                >
                  Skip all
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface-sunken px-4 py-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Pill tone={toneFor[item.type]}>{item.type}</Pill>
                    <span className="text-small text-foreground">{item.text}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-tabular text-caption text-muted-foreground">
                      {Math.round(item.confidence * 100)}%
                    </span>
                    {/*
                     * @behavior: Accept one proposal and create the corresponding record in library.
                     * @convex-mutation-needed: brainDumps.acceptProposal
                     * @confirm: undoable 5s
                     */}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setItems((prev) => prev.filter((it) => it.id !== item.id));
                        toast(`Accepted "${item.text.slice(0, 24)}…". (demo)`);
                      }}
                    >
                      Accept
                    </Button>
                    {/*
                     * @behavior: Discard a single proposal; nothing is written.
                     * @convex-mutation-needed: brainDumps.discardProposal
                     */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setItems((prev) => prev.filter((it) => it.id !== item.id));
                        toast("Skipped. (demo)");
                      }}
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              ))}
              {items.length === 0 ? (
                <div className="rounded-lg bg-surface-sunken p-6 text-center text-small text-muted-foreground">
                  All cleared. Nothing is stored until you accept something.
                  {" "}
                  {/*
                   * @behavior: Return to Today once the user is done reviewing proposals.
                   * @navigate: /today
                   */}
                  <button
                    type="button"
                    className="underline-offset-4 hover:underline"
                    onClick={() => router.push("/today")}
                  >
                    Back to Today →
                  </button>
                </div>
              ) : null}
            </div>
          </SoftCard>
        </div>
      ) : null}
    </div>
  );
}
