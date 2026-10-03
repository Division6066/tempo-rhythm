"use client";

import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

type NoteRecord = Doc<"notes">;

function sortPinnedFirst(notes: NoteRecord[]): NoteRecord[] {
  return [...notes].sort((a, b) => {
    if (a.pinned === b.pinned) return 0;
    return a.pinned ? -1 : 1;
  });
}

function snippet(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return "No content yet.";
  return trimmed.length > 140 ? `${trimmed.slice(0, 140)}…` : trimmed;
}

type NotesScreenProps = {
  noteId?: string;
};

export function NotesScreen({ noteId }: NotesScreenProps) {
  if (noteId) {
    return <NoteEditor noteId={noteId} />;
  }
  return <NotesList />;
}

function NotesList() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const notes = useQuery(api.notes.list, isAuthenticated ? {} : "skip");
  const createNote = useMutation(api.notes.create);
  const togglePin = useMutation(api.notes.togglePin);
  const removeNote = useMutation(api.notes.remove);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const isLoading = isAuthenticated && notes === undefined;
  const visibleNotes = sortPinnedFirst(notes ?? []);

  const handleCreate = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const id = await createNote({ title: "Untitled note", body: "" });
      router.push(`/notes/${id}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTogglePin = async (id: Id<"notes">) => {
    await togglePin({ noteId: id });
  };

  const handleDelete = async (id: Id<"notes">) => {
    await removeNote({ noteId: id });
    setPendingDeleteId(null);
  };

  return (
    <main className="container mx-auto max-w-4xl px-6 py-12">
      <div className="space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-eyebrow text-muted-foreground">Library</p>
            <h1 className="font-heading text-4xl font-semibold text-foreground">Notes</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {isLoading
                ? "Loading your notes."
                : visibleNotes.length === 0
                  ? "Nothing here yet. A note takes one click."
                  : `${visibleNotes.length} ${visibleNotes.length === 1 ? "note" : "notes"}, pinned first.`}
            </p>
          </div>
          <Button type="button" disabled={isCreating} onClick={() => void handleCreate()}>
            New note
          </Button>
        </header>

        {visibleNotes.length === 0 && !isLoading ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/70 px-6 py-12 text-center">
            <p className="text-lg font-medium text-foreground">No notes yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">Start with whatever is on your mind.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {visibleNotes.map((note) => (
              <li
                key={note._id}
                className="rounded-2xl border border-border bg-card p-4 shadow-card"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <Link href={`/notes/${note._id}`} className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-medium text-foreground">{note.title || "Untitled note"}</p>
                      {note.pinned ? (
                        <span className="rounded-pill bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          Pinned
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{snippet(note.body)}</p>
                  </Link>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      aria-label={note.pinned ? `Unpin ${note.title || "Untitled note"}` : `Pin ${note.title || "Untitled note"}`}
                      onClick={() => void handleTogglePin(note._id)}
                    >
                      {note.pinned ? "Unpin" : "Pin"}
                    </Button>
                    {pendingDeleteId === note._id ? (
                      <>
                        <Button
                          type="button"
                          variant="destructive"
                          aria-label={`Confirm delete ${note.title || "Untitled note"}`}
                          onClick={() => void handleDelete(note._id)}
                        >
                          Confirm delete
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setPendingDeleteId(null)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        aria-label={`Delete ${note.title || "Untitled note"}`}
                        onClick={() => setPendingDeleteId(note._id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

type SaveState = "idle" | "saving" | "saved";

function NoteEditor({ noteId }: { noteId: string }) {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const note = useQuery(
    api.notes.get,
    isAuthenticated ? { noteId: noteId as Id<"notes"> } : "skip",
  );
  const updateNote = useMutation(api.notes.update);
  const togglePin = useMutation(api.notes.togglePin);
  const removeNote = useMutation(api.notes.remove);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const loadedNoteId = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (note && loadedNoteId.current !== note._id) {
      setTitle(note.title);
      setBody(note.body);
      loadedNoteId.current = note._id;
      setSaveState("idle");
    }
  }, [note]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const scheduleSave = (next: { title?: string; body?: string }) => {
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await updateNote({ noteId: noteId as Id<"notes">, ...next });
      setSaveState("saved");
    }, 500);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    scheduleSave({ title: value });
  };

  const handleBodyChange = (value: string) => {
    setBody(value);
    scheduleSave({ body: value });
  };

  const handleTogglePin = async () => {
    await togglePin({ noteId: noteId as Id<"notes"> });
  };

  const handleDelete = async () => {
    await removeNote({ noteId: noteId as Id<"notes"> });
    router.push("/notes");
  };

  if (note === undefined && isAuthenticated) {
    return (
      <main className="container mx-auto max-w-3xl px-6 py-12">
        <p className="text-muted-foreground">Loading note.</p>
      </main>
    );
  }

  if (note === null) {
    return (
      <main className="container mx-auto max-w-3xl px-6 py-12">
        <div className="space-y-4">
          <Link href="/notes" className="text-sm font-medium text-primary">
            ← Back to notes
          </Link>
          <p className="text-lg font-medium text-foreground">This note could not be found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-3xl px-6 py-12">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/notes" className="text-sm font-medium text-primary">
            ← Back to notes
          </Link>
          <div className="flex items-center gap-3">
            <output
              className={cn(
                "text-sm text-muted-foreground",
                saveState === "idle" && "invisible",
              )}
            >
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
            </output>
            <Button type="button" variant="outline" onClick={() => void handleTogglePin()}>
              {note?.pinned ? "Unpin" : "Pin"}
            </Button>
            {confirmingDelete ? (
              <>
                <Button type="button" variant="destructive" onClick={() => void handleDelete()}>
                  Confirm delete
                </Button>
                <Button type="button" variant="outline" onClick={() => setConfirmingDelete(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button type="button" variant="outline" onClick={() => setConfirmingDelete(true)}>
                Delete
              </Button>
            )}
          </div>
        </div>

        <label className="block space-y-2">
          <span className="sr-only">Note title</span>
          <input
            aria-label="Note title"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="Untitled note"
            className="w-full border-none bg-transparent font-heading text-3xl font-semibold text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>

        <label className="block space-y-2">
          <span className="sr-only">Note body</span>
          <textarea
            aria-label="Note body"
            value={body}
            onChange={(event) => handleBodyChange(event.target.value)}
            rows={16}
            placeholder="Write whatever is on your mind."
            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>
      </div>
    </main>
  );
}
