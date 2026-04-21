"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { mockNotes } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

/**
 * NotesScreen — notes index with search + quick capture.
 * @source docs/design/claude-export/design-system/screens-2.jsx (ScreenNotes)
 */
export function NotesScreen() {
  const router = useRouter();
  const toast = useDemoToast();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return mockNotes;
    return mockNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q) ||
        n.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Library"
        title="Notes"
        lede="Short-form thinking. Linked to tasks and projects when you want."
        right={
          <>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes…"
              className="rounded-lg border border-border-soft bg-surface-sunken px-3 py-2 text-small focus:border-primary focus:outline-none"
              /*
               * @behavior: Search notes by title, body, tag.
               * @convex-query-needed: notes.search
               */
            />
            {/*
             * @behavior: Create a blank note and open editor.
             * @convex-mutation-needed: notes.createBlank
             * @navigate: /notes/{newId}
             */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                toast("Created. (demo) notes.createBlank.");
                router.push(`/notes/${mockNotes[0].id}`);
              }}
            >
              + New note
            </Button>
          </>
        }
      />

      <div className="grid gap-5 px-6 py-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((note) => (
          <SoftCard key={note.id} tone="default" padding="md">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="font-eyebrow">{note.type}</div>
                {/*
                 * @behavior: Open the note detail editor.
                 * @navigate: /notes/{noteId}
                 * @convex-query-needed: notes.byId
                 */}
                <button
                  type="button"
                  className="text-left font-serif text-h4 hover:underline"
                  onClick={() => router.push(`/notes/${note.id}`)}
                >
                  {note.title}
                </button>
                <p className="text-small text-muted-foreground">{note.excerpt}</p>
              </div>
              <Pill tone="neutral">{note.updatedAtLabel.split(" ").pop()}</Pill>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {note.tags.map((tag) => (
                <Pill key={tag} tone="slate">
                  {tag}
                </Pill>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border-soft pt-3 text-caption text-muted-foreground">
              <span>{note.updatedAtLabel}</span>
              {/*
               * @behavior: Delete note with 30-day soft-delete recoverable window.
               * @convex-mutation-needed: notes.softDelete
               * @confirm: undoable 10s
               */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast("Archived. (demo) notes.softDelete.")}
              >
                Archive
              </Button>
            </div>
          </SoftCard>
        ))}
      </div>
    </div>
  );
}
