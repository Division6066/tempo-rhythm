import { useState } from "react";
import { EmptyState } from "@tempo-v0/components/tempo/empty-state";
import { Button } from "@tempo-v0/components/ui/button";
import { Textarea } from "@tempo-v0/components/ui/textarea";
import { Markdown } from "@tempo-v0/lib/markdown";
import { studioStore, useStudio } from "@tempo-v0/lib/tempo/studio";

const PROMPT = "Two minutes, three sentences. What actually happened today?";

export function JournalView() {
  const { journal } = useStudio();
  const [draft, setDraft] = useState("");
  const [writing, setWriting] = useState(false);

  if (!writing && journal.length === 0) {
    return (
      <EmptyState
        title="No entries yet."
        body="Two minutes, three sentences. That counts."
        actionLabel="Two minutes"
        onAction={() => setWriting(true)}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header>
        <p className="text-sm text-muted">You · journal</p>
        <h1 className="font-display text-4xl font-medium tracking-tight">Journal</h1>
        <p className="mt-2 font-display text-muted">{PROMPT}</p>
      </header>
      {writing ? (
        <div className="rounded-xl border border-border bg-surface p-4">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-40 border-0 bg-transparent font-display text-lg"
            placeholder="Start anywhere."
          />
          <div className="mt-3 flex gap-2">
            <Button
              onClick={() => {
                if (!draft.trim()) return;
                studioStore.addJournal(draft.trim());
                setDraft("");
                setWriting(false);
              }}
            >
              Keep this
            </Button>
            <Button variant="ghost" onClick={() => setWriting(false)}>
              Not now
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setWriting(true)}>
          New entry
        </Button>
      )}
      <div className="space-y-4">
        {journal.map((entry) => (
          <article key={entry.id} className="rounded-xl border border-border bg-surface p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
              {entry.day} · {entry.mood}
            </p>
            <h2 className="mt-1 font-display text-2xl">{entry.title}</h2>
            <Markdown source={entry.body} className="mt-3" />
          </article>
        ))}
      </div>
    </div>
  );
}
