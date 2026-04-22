"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { formatLongDate, getLocalDateKey } from "@/lib/localDay";

const AUTOSAVE_DELAY_MS = 1_000;

export function JournalScreen() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const dateKey = useMemo(() => getLocalDateKey(), []);
  const heading = useMemo(() => formatLongDate(), []);

  const entry = useQuery(
    api.journal.getByDate,
    isAuthenticated ? { dateKey } : "skip",
  );
  const upsertByDate = useMutation(api.journal.upsertByDate);

  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const hydratedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (entry === undefined || hydratedRef.current) return;
    if (entry) {
      setBody(entry.body);
      setLastSavedAt(entry.updatedAt);
    }
    hydratedRef.current = true;
  }, [entry]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const scheduleSave = (next: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(async () => {
      try {
        setIsSaving(true);
        await upsertByDate({ dateKey, body: next });
        setLastSavedAt(Date.now());
      } catch {
        // silent — next save attempt will retry
      } finally {
        setIsSaving(false);
      }
    }, AUTOSAVE_DELAY_MS);
  };

  const flushSave = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    try {
      setIsSaving(true);
      await upsertByDate({ dateKey, body });
      setLastSavedAt(Date.now());
    } catch {
      // silent
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading || (isAuthenticated && entry === undefined)) {
    return (
      <div className="container mx-auto max-w-3xl px-6 py-12 space-y-6">
        <div className="h-12 w-60 animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-3xl px-6 py-16 text-center">
        <SoftCard className="mx-auto max-w-xl">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Sign in required</h1>
          <p className="mt-3 text-muted-foreground">Sign in to open today's journal.</p>
          <Button asChild className="mt-6">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </SoftCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-6 py-12">
      <header className="space-y-3 mb-8">
        <p className="text-sm font-medium text-muted-foreground">Library</p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          {heading}
        </h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <p>A quiet page for today.</p>
          <span aria-hidden>·</span>
          <div className="inline-flex items-center gap-2">
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                <span>Saving…</span>
              </>
            ) : lastSavedAt ? (
              <span>Saved · {formatRelative(lastSavedAt)}</span>
            ) : (
              <span>Unsaved</span>
            )}
          </div>
        </div>
      </header>

      <textarea
        value={body}
        onChange={(event) => {
          const next = event.target.value;
          setBody(next);
          scheduleSave(next);
        }}
        onBlur={() => void flushSave()}
        placeholder="How are you feeling? Anything at all — a sentence is enough."
        rows={16}
        className="min-h-[360px] w-full resize-y rounded-2xl border border-border/80 bg-card/60 p-5 text-base leading-relaxed text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] outline-none focus:ring-2 focus:ring-primary"
        aria-label={`Journal entry for ${dateKey}`}
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
