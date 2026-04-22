"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

const CONFIRM_TTL_MS = 4_000;

export function BrainDumpScreen() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const createNote = useMutation(api.notes.create);

  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const confirmTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) {
        clearTimeout(confirmTimerRef.current);
      }
    };
  }, []);

  if (isAuthLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-6 py-12 space-y-6">
        <div className="h-12 w-60 animate-pulse rounded-xl bg-muted" />
        <div className="h-80 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-3xl px-6 py-16 text-center">
        <SoftCard className="mx-auto max-w-xl">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Sign in required</h1>
          <p className="mt-3 text-muted-foreground">
            Sign in to save your brain dump to your notes.
          </p>
          <Button asChild className="mt-6">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </SoftCard>
      </div>
    );
  }

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Write something before capturing — even a single word is fine.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const today = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const title = `Brain dump — ${today}`;

    try {
      await createNote({ title, body: trimmed });
      setText("");
      setConfirmation("Captured. Find it in Notes.");
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = window.setTimeout(
        () => setConfirmation(null),
        CONFIRM_TTL_MS,
      );
    } catch {
      setError("Couldn't capture that right now. Give it another try.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-6 py-12">
      <header className="space-y-3 mb-8">
        <p className="text-sm font-medium text-muted-foreground">Flow</p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Brain dump
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Everything floating around, down here. No structure required. We'll save it to Notes so
          nothing gets lost.
        </p>
      </header>

      <textarea
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          if (error) setError(null);
        }}
        disabled={isSubmitting}
        placeholder="What's on your mind? Dump it all here."
        rows={14}
        className="min-h-[320px] w-full resize-y rounded-2xl border border-border/80 bg-card/60 p-5 text-base leading-relaxed text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-70"
        aria-label="Brain dump text"
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-6 text-sm">
          {error ? (
            <p className="text-destructive">{error}</p>
          ) : confirmation ? (
            <p className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" aria-hidden />
              {confirmation}
            </p>
          ) : (
            <p className="text-muted-foreground">
              We'll tuck it into Notes as "Brain dump — today's date".
            </p>
          )}
        </div>

        <Button
          type="button"
          onClick={() => void submit()}
          disabled={isSubmitting}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Capturing…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" aria-hidden />
              Capture
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
