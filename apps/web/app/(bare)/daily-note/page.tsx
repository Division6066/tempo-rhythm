/**
 * @screen: daily-note
 * @category: Flow
 * @source: docs/design/claude-export/design-system/screens-7.jsx (daily note cues) + mockDailyNote
 * @queries:
 *   - notes.getDailyByDate withIndex("by_userId_updatedAt") (Long Run 2; periodType daily)
 * @mutations:
 *   - notes.updateBody ({ noteId }) @index by_userId_deletedAt
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useState } from "react";
import { mockDailyNote } from "@tempo/mock-data";
import { Button, Pill, SoftCard, TaskRow } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");
  const [topTasks, setTopTasks] = useState(() =>
    mockDailyNote.topTasks.map((t) => ({ ...t, done: t.done })),
  );
  const [laterTasks, setLaterTasks] = useState(() =>
    mockDailyNote.laterTasks.map((t) => ({ ...t, done: t.done })),
  );

  const toggleTop = (id: string, next: boolean) => {
    setTopTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: next } : t)));
  };
  const toggleLater = (id: string, next: boolean) => {
    setLaterTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: next } : t)));
  };

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-3xl space-y-8 p-6 pb-24 md:p-8">
        <header className="space-y-2">
          <p className="font-eyebrow text-muted-foreground">{mockDailyNote.fileName}</p>
          <h1 className="text-h1 font-serif text-foreground">{mockDailyNote.headline}</h1>
          <p className="text-caption text-muted-foreground">{mockDailyNote.streakLabel}</p>
        </header>

        <SoftCard tone="sunken" padding="md">
          <p className="text-body leading-relaxed text-foreground">{mockDailyNote.coachGreeting}</p>
        </SoftCard>

        <section aria-labelledby="dn-top-label">
          <h2 id="dn-top-label" className="mb-3 font-eyebrow text-muted-foreground">
            Top of mind
          </h2>
          <SoftCard padding="none" className="divide-y divide-border-soft border-border-soft">
            {topTasks.map((t) => (
              <TaskRow
                key={t.id}
                taskId={t.id}
                title={t.title}
                done={t.done}
                meta={[t.time, t.tag, t.energy].filter(Boolean).join(" · ")}
                onToggle={(id, next) => toggleTop(id, next)}
                trailing={t.tag ? <Pill tone="slate">{t.tag}</Pill> : null}
              />
            ))}
          </SoftCard>
        </section>

        <section aria-labelledby="dn-later-label">
          <h2 id="dn-later-label" className="mb-3 font-eyebrow text-muted-foreground">
            Later
          </h2>
          <SoftCard padding="none" className="divide-y divide-border-soft border-border-soft">
            {laterTasks.map((t) => (
              <TaskRow
                key={t.id}
                taskId={t.id}
                title={t.title}
                done={t.done}
                meta={t.tag ?? ""}
                onToggle={(id, next) => toggleLater(id, next)}
                trailing={t.tag ? <Pill tone="neutral">{t.tag}</Pill> : null}
              />
            ))}
          </SoftCard>
        </section>

        {/*
          @action saveDailyNote
          @mutation: notes.upsertDaily ({ date, bodyMarkdown }) @index by_userId_updatedAt
          @soft-delete: no
          @auth: required
          @errors: toast
          @env: NEXT_PUBLIC_CONVEX_URL
        */}
        <Button type="button" variant="primary" className="w-full sm:w-auto">
          Save note
        </Button>
      </div>
    </ScreenSurface>
  );
}
