"use client";

import { type FormEvent, useEffect, useState } from "react";
import { fromDateInputValue, toDateInputValue } from "@/lib/calendar/date-math";

export type EventRowEvent = {
  id: string;
  title: string;
  startsAtMs: number;
};

export type EventRowActions = {
  onUpdate: (event: EventRowEvent, patch: { title: string; startsAtMs: number }) => Promise<void>;
  onDelete: (event: EventRowEvent) => Promise<void>;
};

const dateFormat: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
};

export function EventRow({ event, actions }: { event: EventRowEvent; actions?: EventRowActions }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [dateValue, setDateValue] = useState(() => toDateInputValue(new Date(event.startsAtMs)));
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function run(action: () => Promise<void>, onDone?: () => void) {
    setIsBusy(true);
    try {
      await action();
      setError(null);
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not go through yet.");
    } finally {
      setIsBusy(false);
    }
  }

  function handleSave(submit: FormEvent<HTMLFormElement>) {
    submit.preventDefault();
    if (!actions) return;
    const { onUpdate } = actions;
    void run(
      async () => {
        const startsAtMs = fromDateInputValue(dateValue).getTime();
        await onUpdate(event, { title, startsAtMs });
      },
      () => setIsEditing(false)
    );
  }

  return (
    <li className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
      {isEditing ? (
        <form className="flex flex-wrap items-end gap-3" onSubmit={handleSave}>
          <label className="flex flex-col gap-1 text-caption text-muted-foreground">
            Title
            <input
              className="rounded-xl border border-border bg-background px-3 py-2 text-body text-foreground"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            />
          </label>
          <label className="flex flex-col gap-1 text-caption text-muted-foreground">
            Date
            <input
              className="rounded-xl border border-border bg-background px-3 py-2 text-body text-foreground"
              onChange={(e) => setDateValue(e.target.value)}
              type="date"
              value={dateValue}
            />
          </label>
          <button
            className="min-h-11 rounded-xl bg-primary px-4 text-small font-medium text-primary-foreground"
            disabled={isBusy}
            type="submit"
          >
            Save
          </button>
          <button
            className="min-h-11 rounded-xl px-4 text-small text-muted-foreground"
            onClick={() => {
              setIsEditing(false);
              setTitle(event.title);
              setError(null);
            }}
            type="button"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-foreground">{event.title}</p>
            <p className="mt-1 text-caption text-muted-foreground">
              {new Date(event.startsAtMs).toLocaleDateString(undefined, dateFormat)}
            </p>
          </div>
          {actions ? (
            <div className="flex gap-2">
              <button
                aria-label={`Edit ${event.title}`}
                className="min-h-11 rounded-xl px-3 text-small text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setTitle(event.title);
                  setDateValue(toDateInputValue(new Date(event.startsAtMs)));
                  setIsEditing(true);
                }}
                type="button"
              >
                Edit
              </button>
              <button
                aria-label={`Delete ${event.title}`}
                className="min-h-11 rounded-xl px-3 text-small text-muted-foreground hover:text-foreground"
                disabled={isBusy}
                onClick={() => void run(() => actions.onDelete(event))}
                type="button"
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>
      )}
      {error ? (
        <p className="mt-2 text-small text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </li>
  );
}

export type UndoToastState = { eventId: string; title: string; undoUntilMs: number };

/** "Event removed. Undo" toast; disappears once `undoUntilMs` passes. */
export function UndoToast({
  toast,
  onUndo,
  onExpire,
}: {
  toast: UndoToastState;
  onUndo: () => Promise<void>;
  onExpire: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const { undoUntilMs } = toast;

  useEffect(() => {
    const remaining = undoUntilMs - Date.now();
    if (remaining <= 0) {
      onExpire();
      return;
    }
    const timer = setTimeout(onExpire, remaining);
    return () => clearTimeout(timer);
  }, [undoUntilMs, onExpire]);

  return (
    <output className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-border bg-card px-5 py-3 shadow-soft">
      <span className="text-small text-foreground">Event removed.</span>
      <button
        className="min-h-11 text-small font-medium text-primary"
        onClick={() => {
          onUndo().catch((err: unknown) =>
            setError(err instanceof Error ? err.message : "Could not undo that yet.")
          );
        }}
        type="button"
      >
        Undo
      </button>
      {error ? (
        <span className="text-small text-destructive" role="alert">
          {error}
        </span>
      ) : null}
    </output>
  );
}
