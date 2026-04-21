"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { mockNotes } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

type Props = {
  noteId: string;
};

/**
 * NoteDetailScreen — rich note editor demo.
 * @source docs/design/claude-export/design-system/screens-2.jsx (ScreenNoteEditor)
 */
export function NoteDetailScreen({ noteId }: Props) {
  const router = useRouter();
  const toast = useDemoToast();
  const note = useMemo(
    () => mockNotes.find((n) => n.id === noteId) ?? mockNotes[0],
    [noteId],
  );
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(
    `${note.excerpt}\n\nThis is a frontend-only demo note. When Convex is wired, your changes will persist via notes.updateBody and extraction proposals will appear as chips below.`,
  );

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow={`Notes / ${note.type}`}
        title={title}
        lede={note.updatedAtLabel}
        right={
          <>
            {/*
             * @behavior: Navigate back to notes index.
             * @navigate: /notes
             */}
            <Button variant="ghost" size="sm" onClick={() => router.push("/notes")}>
              ← All notes
            </Button>
            {/*
             * @behavior: Pin note to the sidebar.
             * @convex-mutation-needed: notes.togglePin
             */}
            <Button
              variant="soft"
              size="sm"
              onClick={() => toast("Pinned. (demo) notes.togglePin.")}
            >
              ⭐ Pin
            </Button>
            {/*
             * @behavior: Extract tasks + linked items from the note body.
             * @convex-action-needed: notes.extractActions
             * @provider-needed: openrouter
             */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => toast("Extracting. (demo) notes.extractActions.")}
            >
              ✨ Extract
            </Button>
          </>
        }
      />

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SoftCard tone="default" padding="md">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-3 w-full bg-transparent font-serif text-h2 focus:outline-none"
            /*
             * @behavior: Rename the note; debounce save.
             * @convex-mutation-needed: notes.renameTitle
             */
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            className="w-full resize-y bg-transparent font-serif text-body leading-relaxed focus:outline-none"
            /*
             * @behavior: Persist the note body on blur / debounce.
             * @convex-mutation-needed: notes.updateBody
             * @optimistic: patch locally, reconcile server
             */
          />
        </SoftCard>

        <div className="flex flex-col gap-5">
          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow mb-2">Tags</div>
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <Pill key={tag} tone="slate">
                  {tag}
                </Pill>
              ))}
              {/*
               * @behavior: Add a new tag to this note.
               * @convex-mutation-needed: notes.addTag
               */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast("Tag added. (demo) notes.addTag.")}
              >
                + Tag
              </Button>
            </div>
          </SoftCard>

          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow mb-2">Linked items</div>
            <ul className="flex flex-col gap-2 text-small text-muted-foreground">
              <li>🗂 Tempo Flow project</li>
              <li>✅ Call the dentist</li>
              <li>🔁 Shutdown sequence</li>
            </ul>
            {/*
             * @behavior: Attach a task/project/habit to this note.
             * @convex-mutation-needed: notes.linkEntity
             */}
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => toast("Linked. (demo) notes.linkEntity.")}
            >
              + Link
            </Button>
          </SoftCard>

          <SoftCard tone="sunken" padding="md">
            <div className="font-eyebrow mb-2">Revisions</div>
            <ul className="flex flex-col gap-1 text-caption text-muted-foreground">
              <li>v3 · Today 10:40 — you</li>
              <li>v2 · Yesterday 18:02 — coach extract</li>
              <li>v1 · 2 days ago — initial capture</li>
            </ul>
          </SoftCard>
        </div>
      </div>
    </div>
  );
}
