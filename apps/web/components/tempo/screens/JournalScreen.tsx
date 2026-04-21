"use client";

import { useState } from "react";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { mockJournal } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

/**
 * JournalScreen — chronological journal feed with a prompt-of-the-day.
 * @source docs/design/claude-export/design-system/screens-2.jsx (ScreenJournal)
 */
export function JournalScreen() {
  const toast = useDemoToast();
  const [draft, setDraft] = useState("");

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Library"
        title="Journal"
        lede="Thought, feeling, shape. No prompts unless you want them."
        right={
          <Pill tone="moss">{mockJournal.length} entries · last 7 days</Pill>
        }
      />

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow mb-2">Today</div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={6}
              placeholder="What's been on your mind?"
              className="w-full resize-y rounded-lg border border-border-soft bg-surface-sunken p-3 font-serif text-body focus:border-primary focus:outline-none"
              /*
               * @behavior: Persist draft journal entry on blur / autosave.
               * @convex-mutation-needed: journalEntries.saveDraft
               */
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {["foggy", "okay", "bright", "tired", "anxious", "focused"].map((mood) => (
                  /*
                   * @behavior: Attach a mood tag to today's entry.
                   * @convex-mutation-needed: journalEntries.setMood
                   */
                  <Button
                    key={mood}
                    variant="subtle"
                    size="sm"
                    onClick={() => toast(`Mood: ${mood}. (demo) journalEntries.setMood.`)}
                  >
                    {mood}
                  </Button>
                ))}
              </div>
              {/*
               * @behavior: Commit today's entry.
               * @convex-mutation-needed: journalEntries.commitEntry
               * @confirm: undoable 30s
               */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => toast("Saved. (demo) journalEntries.commitEntry.")}
              >
                Save entry
              </Button>
            </div>
          </SoftCard>

          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow mb-2">Recent</div>
            <div className="flex flex-col divide-y divide-border-soft">
              {mockJournal.map((entry) => (
                <div key={entry.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-tabular text-caption text-muted-foreground">
                      {entry.dateLabel}
                    </span>
                    <Pill tone="slate">{entry.mood}</Pill>
                  </div>
                  <p className="mt-1 font-serif text-body">{entry.excerpt}</p>
                  <div className="mt-2 flex gap-1.5">
                    {entry.tags.map((tag) => (
                      <Pill key={tag} tone="neutral">
                        {tag}
                      </Pill>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SoftCard>
        </div>

        <div className="flex flex-col gap-5">
          <SoftCard tone="sunken" padding="md">
            <div className="font-eyebrow mb-2">Prompt</div>
            <p className="font-serif text-body">
              What surprised you today, even a little?
            </p>
            {/*
             * @behavior: Swap to a different gentle prompt.
             * @convex-query-needed: journalEntries.getDailyPrompt
             */}
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => toast("New prompt. (demo) journalEntries.getDailyPrompt.")}
            >
              Another →
            </Button>
          </SoftCard>

          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow mb-2">Streak</div>
            <div className="font-tabular text-h2">12 days</div>
            <p className="text-caption text-muted-foreground">
              Missed days don't reset — we just let them rest.
            </p>
          </SoftCard>
        </div>
      </div>
    </div>
  );
}
