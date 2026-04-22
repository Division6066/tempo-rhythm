"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type NoteRow = {
  _id: Id<"notes">;
  title: string;
  body: string;
  pinned: boolean;
  updatedAt: number;
};

export function NotesScreen() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const notes = useQuery(api.notes.list, isAuthenticated ? {} : "skip");

  if (isAuthLoading) {
    return <NotesSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-4xl px-6 py-16 text-center">
        <SoftCard className="mx-auto max-w-xl">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Sign in required</h1>
          <p className="mt-3 text-muted-foreground">Sign in to see your notes.</p>
          <Button asChild className="mt-6">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </SoftCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <header className="space-y-3 mb-8">
        <p className="text-sm font-medium text-muted-foreground">Library</p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Notes
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Anything you want to remember. Write once, find it later.
        </p>
      </header>

      <NoteQuickCreate />

      {notes === undefined ? (
        <div className="mt-8">
          <NotesListSkeleton />
        </div>
      ) : notes.length === 0 ? (
        <section className="mt-8 rounded-3xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <p className="text-base text-foreground">No notes yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            What would you like to remember? Give it a title above to begin.
          </p>
        </section>
      ) : (
        <NoteList notes={notes as NoteRow[]} />
      )}
    </div>
  );
}

function NoteQuickCreate() {
  const createNote = useMutation(api.notes.create);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hint, setHint] = useState("");

  const submit = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setHint("Give the note a title so you can find it later.");
      return;
    }

    setIsSubmitting(true);
    setHint("");

    try {
      const noteId = await createNote({ title: trimmed, body: "" });
      setTitle("");
      router.push(`/notes/${noteId}`);
    } catch {
      setHint("Could not create that note. Try again?");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
      <div className="mb-3">
        <label htmlFor="notes-quick-create" className="text-sm font-medium text-foreground">
          New note
        </label>
        <p className="mt-1 text-sm text-muted-foreground">A single line is enough to begin.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="notes-quick-create"
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (hint) setHint("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setTitle("");
              setHint("");
            }
            if (event.key === "Enter" && !event.metaKey && !event.ctrlKey) {
              event.preventDefault();
              void submit();
            }
          }}
          disabled={isSubmitting}
          placeholder="Reading list, meeting notes, a small reflection…"
          className="min-h-12 flex-1 rounded-xl border border-border bg-background px-4 py-3 text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none transition focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-70"
        />
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={isSubmitting}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Creating…
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" aria-hidden />
              Create
            </>
          )}
        </Button>
      </div>

      <div className="mt-2 min-h-5">
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

function NoteList({ notes }: { notes: NoteRow[] }) {
  return (
    <ul className="mt-8 space-y-3">
      {notes.map((note) => (
        <li key={note._id}>
          <Link
            href={`/notes/${note._id}`}
            className={cn(
              "block rounded-2xl border border-border/80 bg-background/70 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:border-primary/40 hover:bg-card",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="font-heading text-lg font-semibold text-foreground">
                {note.title || "Untitled"}
              </p>
              <span className="text-xs text-muted-foreground">
                {formatRelative(note.updatedAt)}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {note.body.trim() ? truncate(note.body, 140) : "No body yet."}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function formatRelative(ms: number): string {
  const delta = Date.now() - ms;
  const minutes = Math.round(delta / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return new Date(ms).toLocaleDateString();
}

function NotesSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-6 py-12 space-y-6">
      <div className="h-12 w-48 animate-pulse rounded-xl bg-muted" />
      <div className="h-28 animate-pulse rounded-2xl bg-muted" />
      <NotesListSkeleton />
    </div>
  );
}

function NotesListSkeleton() {
  return (
    <ul className="space-y-3">
      {[0, 1, 2].map((i) => (
        <li key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
      ))}
    </ul>
  );
}
