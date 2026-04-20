/**
 * @screen: journal
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-2.jsx
 * @queries: journalEntries.listByUser (Long Run 2; @todo: requires schema add journalEntries + by_userId_deletedAt)
 * @mutations: journalEntries.upsertDay
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useState } from "react";
import { mockJournalEntries, mockJournalPromptTitle, mockJournalTodayDraft } from "@tempo/mock-data";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

const moodTone: Record<(typeof mockJournalEntries)[0]["mood"], "moss" | "amber" | "slate" | "neutral"> = {
  settled: "moss",
  tired: "slate",
  anxious: "amber",
  steady: "moss",
  bright: "moss",
  low: "slate",
  meh: "neutral",
};

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");
  const [draft, setDraft] = useState(mockJournalTodayDraft);

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-4xl space-y-8 p-6 pb-24 md:p-8">
        <header className="space-y-2">
          <p className="font-eyebrow text-muted-foreground">Library · Journal</p>
          <h1 className="text-h1 font-serif text-foreground">Write it down, gently.</h1>
        </header>

        <SoftCard padding="md">
          <p className="font-eyebrow text-muted-foreground">{mockJournalPromptTitle}</p>
          <label htmlFor="journal-draft" className="sr-only">
            Today&apos;s entry
          </label>
          <textarea
            id="journal-draft"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={10}
            className="mt-3 w-full resize-y rounded-lg border border-border bg-transparent p-3 font-serif text-lg leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {/*
              @action saveJournalEntry
              @mutation: journalEntries.upsertDay (Long Run 2)
              @auth: required
              @errors: toast
              @env: NEXT_PUBLIC_CONVEX_URL
            */}
            <Button type="button" variant="primary">
              Save entry
            </Button>
          </div>
        </SoftCard>

        <section aria-labelledby="journal-past">
          <h2 id="journal-past" className="mb-4 font-eyebrow text-muted-foreground">
            Past entries
          </h2>
          <ul className="space-y-3">
            {mockJournalEntries.map((e) => (
              <li key={e.id}>
                <SoftCard padding="md">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-tabular text-caption text-muted-foreground">{e.date}</span>
                    <Pill tone={moodTone[e.mood]}>{e.mood}</Pill>
                    <span className="text-caption text-muted-foreground">{e.wordCount} words</span>
                  </div>
                  <p className="mt-2 line-clamp-3 font-serif text-small leading-relaxed text-foreground">
                    {e.body}
                  </p>
                </SoftCard>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ScreenSurface>
  );
}
