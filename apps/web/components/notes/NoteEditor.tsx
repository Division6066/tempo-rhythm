"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const AUTOSAVE_DELAY_MS = 1_000;

type NoteEditorProps = {
  noteId: Id<"notes">;
};

export function NoteEditor({ noteId }: NoteEditorProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const note = useQuery(api.notes.get, isAuthenticated ? { noteId } : "skip");
  const updateNote = useMutation(api.notes.update);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const hydratedRef = useRef(false);
  const titleSaveRef = useRef<number | null>(null);
  const bodySaveRef = useRef<number | null>(null);

  // Hydrate local state from server once the note arrives.
  useEffect(() => {
    if (!note || hydratedRef.current) return;
    setTitle(note.title);
    setBody(note.body);
    setLastSavedAt(note.updatedAt);
    hydratedRef.current = true;
  }, [note]);

  const scheduleSave = (patch: { title?: string; body?: string }) => {
    // Clear existing timers for whichever field we're updating.
    if (patch.title !== undefined && titleSaveRef.current) {
      clearTimeout(titleSaveRef.current);
    }
    if (patch.body !== undefined && bodySaveRef.current) {
      clearTimeout(bodySaveRef.current);
    }

    const run = async () => {
      try {
        setIsSaving(true);
        await updateNote({ noteId, ...patch });
        setLastSavedAt(Date.now());
      } catch {
        // Silent — the next save attempt will retry automatically.
      } finally {
        setIsSaving(false);
      }
    };

    const id = window.setTimeout(() => void run(), AUTOSAVE_DELAY_MS);
    if (patch.title !== undefined) titleSaveRef.current = id;
    if (patch.body !== undefined) bodySaveRef.current = id;
  };

  // Flush any pending save on unmount.
  useEffect(() => {
    return () => {
      if (titleSaveRef.current) clearTimeout(titleSaveRef.current);
      if (bodySaveRef.current) clearTimeout(bodySaveRef.current);
    };
  }, []);

  if (isAuthLoading || (isAuthenticated && note === undefined)) {
    return (
      <div className="container mx-auto max-w-3xl px-6 py-12 space-y-6">
        <div className="h-8 w-24 animate-pulse rounded-xl bg-muted" />
        <div className="h-12 w-80 animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-3xl px-6 py-16 text-center">
        <SoftCard className="mx-auto max-w-xl">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Sign in required</h1>
          <p className="mt-3 text-muted-foreground">Sign in to edit your notes.</p>
          <Button asChild className="mt-6">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </SoftCard>
      </div>
    );
  }

  if (note === null) {
    return (
      <div className="container mx-auto max-w-3xl px-6 py-16 text-center">
        <SoftCard className="mx-auto max-w-xl">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            We couldn't find that note
          </h1>
          <p className="mt-3 text-muted-foreground">
            It may have been removed. You can still browse the rest of your notes.
          </p>
          <Button className="mt-6" onClick={() => router.push("/notes")}>
            Back to Notes
          </Button>
        </SoftCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/notes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          All notes
        </Link>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isSaving ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              Saving…
            </>
          ) : lastSavedAt ? (
            <span>Saved · {formatRelative(lastSavedAt)}</span>
          ) : null}
        </div>
      </div>

      <input
        type="text"
        value={title}
        onChange={(event) => {
          const next = event.target.value;
          setTitle(next);
          scheduleSave({ title: next });
        }}
        placeholder="Untitled"
        className="mb-4 w-full border-0 bg-transparent font-heading text-4xl font-semibold tracking-tight text-foreground outline-none focus:ring-0 md:text-5xl"
        aria-label="Note title"
      />

      <textarea
        value={body}
        onChange={(event) => {
          const next = event.target.value;
          setBody(next);
          scheduleSave({ body: next });
        }}
        placeholder="Start writing…"
        className="min-h-[320px] w-full resize-y rounded-2xl border border-border/80 bg-card/60 p-5 text-base leading-relaxed text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}

function formatRelative(ms: number): string {
  const delta = Date.now() - ms;
  const seconds = Math.round(delta / 1_000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  return new Date(ms).toLocaleTimeString();
}
