/**
 * @screen: note-detail
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-2.jsx
 * @queries: notes.getById @index by_userId_deletedAt
 * @mutations: notes.updateBody, notes.softDelete
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { mockNoteDetailLaunchPost, mockNotes } from "@tempo/mock-data";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [mode, setMode] = useState<ViewMode>("ready");

  const note = useMemo(() => mockNotes.find((n) => n.id === id) ?? null, [id]);

  const initialTitle = note?.title ?? (id === mockNoteDetailLaunchPost.id ? mockNoteDetailLaunchPost.title : "");
  const initialBody = useMemo(() => {
    if (note) {
      return note.body;
    }
    if (id === mockNoteDetailLaunchPost.id) {
      return mockNoteDetailLaunchPost.paragraphs.join("\n\n");
    }
    return "";
  }, [id, note]);

  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);

  if (!note && id !== mockNoteDetailLaunchPost.id) {
    return (
      <ScreenSurface mode={mode} onModeChange={setMode}>
        <div className="p-8">
          <SoftCard padding="md">
            <p className="text-body text-muted-foreground">Note not found.</p>
            {/*
              @action backToNotes
              @navigate: /notes
              @auth: required
              @env: NEXT_PUBLIC_CONVEX_URL
            */}
            <Link
              href="/notes"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card px-4 text-body font-medium text-foreground hover:bg-surface-sunken"
            >
              Back to notes
            </Link>
          </SoftCard>
        </div>
      </ScreenSurface>
    );
  }

  const tags = note?.tags ?? [...mockNoteDetailLaunchPost.tags];
  const coachStrip =
    id === mockNoteDetailLaunchPost.id ? mockNoteDetailLaunchPost.coachStrip : null;

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-3xl space-y-6 p-6 pb-24 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          {/*
            @action backToNotesList
            @navigate: /notes
            @auth: required
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Link
            href="/notes"
            className="inline-flex h-9 items-center rounded-md px-3 text-small font-medium text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
          >
            ← Notes
          </Link>
          {tags.map((tag) => (
            <Pill key={tag} tone="slate">
              {tag}
            </Pill>
          ))}
        </div>
        <label htmlFor="note-title" className="sr-only">
          Title
        </label>
        <input
          id="note-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-0 bg-transparent font-serif text-3xl font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {coachStrip ? (
          <SoftCard tone="sunken" padding="md">
            <p className="text-small text-muted-foreground">{coachStrip}</p>
            <div className="mt-3 flex gap-2">
              {/*
                @action acceptCoachNoteSuggestion
                @mutation: notes.applyCoachPatch (Long Run 2)
                @confirm: undoable 5s
                @auth: required
                @errors: toast
                @env: NEXT_PUBLIC_CONVEX_URL
              */}
              <Button type="button" size="sm" variant="primary">
                Show suggestion
              </Button>
              <Button type="button" size="sm" variant="ghost">
                Dismiss
              </Button>
            </div>
          </SoftCard>
        ) : null}
        <label htmlFor="note-body" className="sr-only">
          Body
        </label>
        <textarea
          id="note-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={16}
          className="w-full resize-y rounded-xl border border-border bg-card p-4 font-serif text-lg leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex flex-wrap gap-2">
          {/*
            @action saveNote
            @mutation: notes.updateBody @index by_userId_updatedAt
            @auth: required
            @errors: toast
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button type="button" variant="primary">
            Save
          </Button>
          {/*
            @action deleteNote
            @mutation: notes.softDelete @index by_userId_deletedAt
            @soft-delete: yes
            @confirm: undoable 5s
            @auth: required
            @errors: toast
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button type="button" variant="destructive">
            Move to archive
          </Button>
        </div>
        <p className="text-caption text-muted-foreground">
          {id === mockNoteDetailLaunchPost.id ? mockNoteDetailLaunchPost.savedCaption : null}
        </p>
      </div>
    </ScreenSurface>
  );
}
