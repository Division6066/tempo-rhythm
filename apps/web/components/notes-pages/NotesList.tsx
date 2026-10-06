"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { filterByPeriod, type PeriodType, plainPreview } from "./filterNotes";
import { PeriodFilter } from "./PeriodFilter";

type RemovedNote = { noteId: Id<"notes">; undoUntilMs: number };

export function NotesList() {
  const router = useRouter();
  const params = useSearchParams();
  const rawType = params.get("type");
  const type =
    rawType === "daily" || rawType === "weekly" || rawType === "monthly" ? rawType : "all";
  const { isAuthenticated } = useConvexAuth();
  const [search, setSearch] = useState("");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const notes = useQuery(api.notes.list, isAuthenticated ? { search, pinnedOnly } : "skip");
  const create = useMutation(api.notes.create);
  const togglePin = useMutation(api.notes.togglePin);
  const remove = useMutation(api.notes.remove);
  const restore = useMutation(api.notes.restore);
  const [title, setTitle] = useState("");
  const [periodType, setPeriodType] = useState<PeriodType>("none");
  const [removed, setRemoved] = useState<RemovedNote[]>([]);
  const [pendingDelete, setPendingDelete] = useState<Id<"notes"> | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const isLoading = isAuthenticated && notes === undefined;
  const visible = filterByPeriod(notes ?? [], type).sort(
    (a, b) => Number(b.pinned) - Number(a.pinned)
  );

  useEffect(() => {
    if (!removed.length) return;
    const timeout = setTimeout(
      () => {
        setRemoved((items) => items.filter((item) => item.undoUntilMs > Date.now()));
      },
      Math.max(0, Math.min(...removed.map((item) => item.undoUntilMs)) - Date.now())
    );
    return () => clearTimeout(timeout);
  }, [removed]);

  async function perform(action: () => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch {
      setError("That change could not be saved. Please try again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <main className="container mx-auto max-w-4xl px-6 py-12">
      <div className="space-y-8">
        <header>
          <p className="font-eyebrow text-muted-foreground">Library</p>
          <h1 className="font-heading text-4xl font-semibold text-foreground">Notes</h1>
          <p className="mt-2 text-muted-foreground">
            {isLoading
              ? "Loading your notes."
              : `${visible.length} ${visible.length === 1 ? "note" : "notes"}, pinned first.`}
          </p>
        </header>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void perform(async () => {
              const id = await create({
                title: title.trim() || "Untitled note",
                body: "",
                periodType,
              });
              router.push(`/notes/${id}`);
            });
          }}
        >
          <label className="grid gap-2 text-sm">
            New note title
            <input
              className="rounded-xl border border-border bg-background px-3 py-2"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Untitled note"
            />
          </label>
          <label className="grid gap-2 text-sm">
            New note page type
            <select
              className="rounded-xl border border-border bg-background px-3 py-2"
              value={periodType}
              onChange={(event) => setPeriodType(event.target.value as PeriodType)}
            >
              <option value="none">Plain note</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <Button type="submit" disabled={busy || !isAuthenticated}>
            New note
          </Button>
        </form>
        <div className="space-y-4">
          <label className="grid gap-2 text-sm">
            Search notes
            <input
              type="search"
              className="rounded-xl border border-border bg-background px-3 py-2"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your notes"
            />
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <PeriodFilter value={type} />
            <Button
              type="button"
              variant="outline"
              aria-pressed={pinnedOnly}
              onClick={() => setPinnedOnly(!pinnedOnly)}
            >
              Pinned only
            </Button>
          </div>
        </div>
        {error ? (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        ) : null}
        {removed.map((item) => (
          <output
            key={item.noteId}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
          >
            <span>Note removed. Undo is available for 5 minutes.</span>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() =>
                void perform(async () => {
                  if (Date.now() >= item.undoUntilMs) {
                    setRemoved((items) => items.filter((entry) => entry.noteId !== item.noteId));
                    setError("The undo window has ended.");
                    return;
                  }
                  const result = await restore({ noteId: item.noteId });
                  setRemoved((items) => items.filter((entry) => entry.noteId !== item.noteId));
                  if (!result.success) setError("The undo window has ended.");
                })
              }
            >
              Undo
            </Button>
          </output>
        ))}
        {!isLoading && visible.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/70 px-6 py-12 text-center">
            <p className="text-lg font-medium">
              {search || pinnedOnly || type !== "all"
                ? "No notes match these filters."
                : "No notes yet."}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {search || pinnedOnly || type !== "all"
                ? "Try another filter whenever you like."
                : "Start with whatever is on your mind."}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {visible.map((note) => (
              <li
                key={note._id}
                className="rounded-2xl border border-border bg-card p-4 shadow-card"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <Link href={`/notes/${note._id}`} className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-medium">{note.title || "Untitled note"}</p>
                      {note.pinned ? (
                        <span className="rounded-pill bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          Pinned
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{plainPreview(note.body)}</p>
                  </Link>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busy}
                      aria-label={`${note.pinned ? "Unpin" : "Pin"} ${note.title || "Untitled note"}`}
                      onClick={() =>
                        void perform(async () => {
                          await togglePin({ noteId: note._id });
                        })
                      }
                    >
                      {note.pinned ? "Unpin" : "Pin"}
                    </Button>
                    {pendingDelete === note._id ? (
                      <>
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={busy}
                          aria-label={`Confirm delete ${note.title || "Untitled note"}`}
                          onClick={() =>
                            void perform(async () => {
                              const result = await remove({ noteId: note._id });
                              if (result.success) {
                                setRemoved((items) => [
                                  ...items,
                                  { noteId: note._id, undoUntilMs: result.undoUntilMs },
                                ]);
                                setPendingDelete(null);
                              }
                            })
                          }
                        >
                          Confirm delete
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={busy}
                          onClick={() => setPendingDelete(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busy}
                        aria-label={`Delete ${note.title || "Untitled note"}`}
                        onClick={() => setPendingDelete(note._id)}
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
