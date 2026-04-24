"use client";

import { useMutation } from "convex/react";
import { Loader2, Sparkles, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { prioritizeBrainDumpText, type BrainDumpPreviewItem } from "@/lib/brainDumpPrioritizer";
import { cn } from "@/lib/utils";

type TodayBrainDumpPanelProps = {
  /** Timestamp inside the current local day so new tasks show on Today. */
  dueAt: number;
};

const priorityClass: Record<BrainDumpPreviewItem["priority"], string> = {
  high: "text-destructive",
  medium: "text-primary",
  low: "text-muted-foreground",
};

const priorityLabel: Record<BrainDumpPreviewItem["priority"], string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function TodayBrainDumpPanel({ dueAt }: TodayBrainDumpPanelProps) {
  const createTask = useMutation(api.tasks.create);
  const [rawText, setRawText] = useState("");
  const [parseHint, setParseHint] = useState("");
  const [workingItems, setWorkingItems] = useState<BrainDumpPreviewItem[] | null>(null);
  const [draftIsStale, setDraftIsStale] = useState(false);
  const [isPreviewPending, startPreviewTransition] = useTransition();
  const [isApplying, setIsApplying] = useState(false);
  const [applyHint, setApplyHint] = useState("");
  const [lastAddedCount, setLastAddedCount] = useState<number | null>(null);

  const runPreview = () => {
    setParseHint("");
    setApplyHint("");
    setLastAddedCount(null);
    startPreviewTransition(() => {
      const result = prioritizeBrainDumpText(rawText);
      if (!result.ok) {
        setWorkingItems(null);
        setParseHint(result.error);
        setDraftIsStale(false);
        return;
      }
      setWorkingItems(result.items);
      setDraftIsStale(false);
    });
  };

  const onTextChange = (value: string) => {
    setRawText(value);
    if (workingItems !== null) {
      setDraftIsStale(true);
    }
    if (parseHint) setParseHint("");
    if (lastAddedCount !== null) setLastAddedCount(null);
  };

  const clearAll = () => {
    setRawText("");
    setWorkingItems(null);
    setParseHint("");
    setApplyHint("");
    setDraftIsStale(false);
    setLastAddedCount(null);
  };

  const removeItem = (id: string) => {
    setWorkingItems((prev) => {
      if (!prev) return null;
      const next = prev.filter((it) => it.id !== id);
      return next.length === 0 ? null : next;
    });
  };

  const applyToToday = async () => {
    if (!workingItems?.length) return;
    setIsApplying(true);
    setApplyHint("");
    setLastAddedCount(null);
    const total = workingItems.length;
    let added = 0;
    for (const it of workingItems) {
      try {
        await createTask({
          title: it.title,
          priority: it.priority,
          dueAt,
          status: "todo",
        });
        added += 1;
      } catch {
        // keep going; user can retry remaining from a new preview
      }
    }
    setIsApplying(false);
    if (added === 0) {
      setApplyHint("Nothing was added. Check your connection and try again.");
      return;
    }
    if (added < total) {
      setApplyHint(`Added ${added} of ${total}. You can preview again and add what’s left.`);
    } else {
      setLastAddedCount(added);
    }
    setRawText("");
    setWorkingItems(null);
    setDraftIsStale(false);
  };

  return (
    <section
      className="rounded-2xl border border-border/80 bg-card/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
      aria-labelledby="today-brain-dump-heading"
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 id="today-brain-dump-heading" className="text-sm font-medium text-foreground">
            Brain dump
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Pour everything in. We’ll suggest order — you confirm before anything is saved.
          </p>
        </div>
      </div>

      <label className="sr-only" htmlFor="today-brain-dump-textarea">
        Brain dump
      </label>
      <textarea
        id="today-brain-dump-textarea"
        value={rawText}
        onChange={(e) => onTextChange(e.target.value)}
        disabled={isApplying}
        rows={5}
        placeholder="Anything circling: errands, worries, one-line tasks…"
        className="min-h-[7.5rem] w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none transition focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-70"
      />

      {draftIsStale && workingItems ? (
        <output className="mt-2 block text-sm text-muted-foreground" aria-live="polite">
          Text changed since last preview. Preview again to refresh the list.
        </output>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          className="rounded-xl"
          onClick={() => void runPreview()}
          disabled={isApplying || isPreviewPending}
        >
          {isPreviewPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Sorting…
            </>
          ) : (
            "Preview priorities"
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="rounded-xl text-muted-foreground"
          onClick={() => clearAll()}
          disabled={isApplying || (!rawText.trim() && !workingItems)}
        >
          <Trash2 className="mr-2 h-4 w-4" aria-hidden />
          Clear
        </Button>
      </div>

      {parseHint ? (
        <output className="mt-3 block text-sm text-muted-foreground" aria-live="polite">
          {parseHint}
        </output>
      ) : null}

      {workingItems && workingItems.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-foreground">Ready to add</p>
          <ul className="space-y-2" aria-label="Prioritized task preview">
            {workingItems.map((it) => (
              <li
                key={it.id}
                className="flex items-start gap-2 rounded-xl border border-border/80 bg-background/60 px-3 py-2"
              >
                <p className="min-w-0 flex-1 text-sm text-foreground">
                  {it.title}
                </p>
                <span
                  className={cn(
                    "shrink-0 text-xs font-semibold uppercase tracking-wide",
                    priorityClass[it.priority],
                  )}
                >
                  {priorityLabel[it.priority]}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(it.id)}
                  className="shrink-0 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  disabled={isApplying}
                  aria-label={`Remove from list: ${it.title}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button
              type="button"
              className="rounded-xl"
              onClick={() => void applyToToday()}
              disabled={isApplying || workingItems.length === 0}
            >
              {isApplying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Adding…
                </>
              ) : (
                "Add to today"
              )}
            </Button>
          </div>
        </div>
      ) : null}

      {applyHint ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {applyHint}
        </p>
      ) : null}
      {lastAddedCount !== null && lastAddedCount > 0 ? (
        <output className="mt-3 block text-sm text-muted-foreground" aria-live="polite">
          Added {lastAddedCount} {lastAddedCount === 1 ? "item" : "items"} to today. You can
          adjust them anytime.
        </output>
      ) : null}
    </section>
  );
}
