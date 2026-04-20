/**
 * @screen: brain-dump
 * @category: Flow
 * @source: docs/design/claude-export/design-system/screens-1.jsx:L113-L205
 * @queries: none (RAM-only scan in Long Run 2; never persist raw dump per HARD_RULES)
 * @mutations:
 *   - brainDump.sortInMemory then tasks.create proposals (@todo: requires schema add brainDumpItems + proposal flow)
 * @routes-to: /tasks (after accept)
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useMemo, useState } from "react";
import {
  mockBrainDumpDefaultText,
  mockBrainDumpPrompts,
  mockBrainDumpSortedItems,
} from "@tempo/mock-data";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { Mic, Sparkles } from "@tempo/ui/icons";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

function toneFor(t: (typeof mockBrainDumpSortedItems)[0]["type"]) {
  const map = {
    task: "orange" as const,
    reminder: "slate" as const,
    idea: "moss" as const,
    worry: "amber" as const,
    note: "neutral" as const,
  };
  return map[t];
}

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");
  const [text, setText] = useState(mockBrainDumpDefaultText);
  const [processed, setProcessed] = useState(true);

  const wordCount = useMemo(() => {
    const w = text.trim().split(/\s+/).filter(Boolean);
    return w.length;
  }, [text]);

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-6xl space-y-8 p-6 pb-24 md:p-8">
        <header className="space-y-2">
          <p className="font-eyebrow text-muted-foreground">Brain Dump</p>
          <h1 className="text-h1 font-serif text-foreground">Everything on your mind.</h1>
          <p className="max-w-2xl text-body leading-relaxed text-muted-foreground">
            Don&apos;t organize it. Just type. I&apos;ll sort it into tasks, reminders, ideas, and worries
            — then you approve what sticks.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <SoftCard padding="md">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-h3 font-serif text-foreground">Dump</h2>
              <div className="flex items-center gap-2">
                {/*
                  @action startVoiceDictation
                  @action-call: voice.startDictation (RAM-only pipeline; no raw persist)
                  @auth: required
                  @errors: toast mic permission
                  @env: NEXT_PUBLIC_CONVEX_URL
                  @source: screens-1.jsx:L143
                */}
                <Button type="button" variant="ghost" size="sm" aria-label="Dictate" title="Dictate">
                  <Mic size={16} />
                </Button>
                <span className="text-caption font-tabular text-muted-foreground">
                  {text.length} chars · {wordCount} words
                </span>
              </div>
            </div>
            <label htmlFor="brain-dump-text" className="sr-only">
              Brain dump text
            </label>
            <textarea
              id="brain-dump-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              className="min-h-[280px] w-full resize-y rounded-lg border border-border bg-transparent px-0 py-2 font-serif text-lg leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-caption text-muted-foreground">
                End-to-end encrypted. Only you see this.
              </span>
              {/*
                @action sortBrainDump
                @mutation: brainDump.proposeSortedItems (RAM-only input; proposals only to tasks table after confirm)
                @index: n/a until schema
                @soft-delete: n/a
                @auth: required
                @errors: toast
                @env: NEXT_PUBLIC_CONVEX_URL
                @source: screens-1.jsx:L153
              */}
              <Button
                type="button"
                variant="primary"
                leadingIcon={<Sparkles size={14} />}
                onClick={() => setProcessed(true)}
              >
                Sort it
              </Button>
            </div>
          </SoftCard>

          <div className="space-y-6">
            <SoftCard padding="md">
              <p className="mb-3 font-eyebrow text-muted-foreground">Gentle prompts</p>
              <div className="space-y-2">
                {mockBrainDumpPrompts.map((q) => (
                  <div
                    key={q}
                    className="rounded-lg bg-surface-sunken px-3 py-2.5 font-serif text-small leading-relaxed text-foreground"
                  >
                    {q}
                  </div>
                ))}
              </div>
            </SoftCard>
            <SoftCard tone="sunken" padding="md">
              <p className="font-eyebrow text-muted-foreground">Privacy</p>
              <p className="mt-2 text-small text-muted-foreground">
                Raw dumps never leave Convex. Only sorted items are written to your library — and only after
                you approve them.
              </p>
            </SoftCard>
          </div>
        </div>

        {processed ? (
          <SoftCard padding="md">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-eyebrow text-muted-foreground">Sorted — 7 items</p>
                <h3 className="text-h3 font-serif text-foreground">Review and approve</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {/*
                  @action approveAllSorted
                  @mutation: tasks.bulkCreateFromBrainDump (Long Run 2; @todo: requires schema add)
                  @confirm: undoable 5s
                  @auth: required
                  @errors: toast
                  @env: NEXT_PUBLIC_CONVEX_URL
                  @source: screens-1.jsx:L181
                */}
                <Button type="button" variant="soft" size="sm">
                  Approve all
                </Button>
                {/*
                  @action skipAllSorted
                  @mutation: none
                  @auth: required
                  @source: screens-1.jsx:L182
                */}
                <Button type="button" variant="ghost" size="sm">
                  Skip all
                </Button>
              </div>
            </div>
            <ul className="space-y-2">
              {mockBrainDumpSortedItems.map((it, i) => (
                <li
                  key={`${it.text}-${i}`}
                  className="flex flex-col gap-3 rounded-lg bg-surface-sunken p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Pill tone={toneFor(it.type)}>{it.type}</Pill>
                    <span className="text-small text-foreground">{it.text}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-caption font-tabular text-muted-foreground">
                      {Math.round(it.confidence * 100)}%
                    </span>
                    {/*
                      @action acceptSortedItem
                      @mutation: tasks.create({ title, source: brain_dump }) @index by_userId_deletedAt
                      @soft-delete: no
                      @confirm: undoable 5s
                      @auth: required
                      @errors: toast
                      @env: NEXT_PUBLIC_CONVEX_URL
                      @source: screens-1.jsx:L194
                    */}
                    <Button type="button" size="sm" variant="primary">
                      Accept
                    </Button>
                    {/*
                      @action skipSortedItem
                      @mutation: none
                      @auth: required
                      @source: screens-1.jsx:L195
                    */}
                    <Button type="button" size="sm" variant="ghost">
                      Skip
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </SoftCard>
        ) : null}
      </div>
    </ScreenSurface>
  );
}
