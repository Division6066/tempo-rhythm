"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  type CalendarViewMode,
  fromDateInputValue,
  getCalendarRangeMs,
  getEventsInRange,
  parseDateInputValue,
  toDateInputValue,
} from "@/lib/calendar/date-math";
import {
  createLocalCalendarEvent,
  loadCalendarEvents,
  type StoredCalendarEvent,
  saveCalendarEvents,
} from "@/lib/calendar/event-source";
import {
  getAddEventAuthState,
  SIGNED_OUT_MESSAGE,
  toAddEventErrorMessage,
} from "./addEventGuard";
import {
  EventRow,
  type EventRowActions,
  type EventRowEvent,
  UndoToast,
  type UndoToastState,
} from "./EventRow";

const viewOptions: Array<{ mode: CalendarViewMode; label: string }> = [
  { mode: "day", label: "Day" },
  { mode: "week", label: "Week" },
  { mode: "month", label: "Month" },
];

function formatRange(mode: CalendarViewMode, range: { startMs: number; endMs: number }): string {
  const start = new Date(range.startMs);
  const endInclusive = new Date(range.endMs - 1);

  if (mode === "day") {
    return start.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  return `${start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} - ${endInclusive.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

type DisplayCalendarEvent = {
  id: string;
  title: string;
  startsAtMs: number;
};

function DueTaskList({
  tasks,
}: {
  tasks: Array<{ _id: string; title: string; dueAt?: number; status: string }>;
}) {
  return (
    <section
      aria-label="Due tasks"
      className="rounded-3xl border border-border bg-card/80 p-5 shadow-soft"
      data-testid="calendar-due-tasks"
    >
      <h2 className="font-eyebrow">Due tasks</h2>
      {tasks.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {tasks.map((task) => (
            <li
              className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3"
              key={task._id}
            >
              <p className="font-medium text-foreground">{task.title}</p>
              <p className="mt-1 text-caption text-muted-foreground">
                {task.dueAt !== undefined
                  ? new Date(task.dueAt).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "No due date"}
                {task.status === "done" ? " · Done" : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-small text-muted-foreground">
          No tasks are due in this window. Today still holds anything without a date.
        </p>
      )}
    </section>
  );
}

function EventList({
  events,
  mode,
  actions,
}: {
  events: DisplayCalendarEvent[];
  mode: CalendarViewMode;
  actions?: EventRowActions;
}) {
  return (
    <section
      aria-label={`${mode} events`}
      className="rounded-3xl border border-border bg-card/80 p-5 shadow-soft"
      data-testid={`${mode}-events`}
    >
      <h2 className="font-eyebrow">{mode} events</h2>
      {events.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {events.map((event) => (
            <EventRow actions={actions} event={event} key={event.id} />
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-small text-muted-foreground">
          No events in this window yet. Add one when you know where it belongs.
        </p>
      )}
    </section>
  );
}

export function CalendarViews({ eventSourceMode }: { eventSourceMode: "convex" | "local" }) {
  const [view, setView] = useState<CalendarViewMode>("day");
  const [selectedDateValue, setSelectedDateValue] = useState(() => toDateInputValue(new Date()));
  const [title, setTitle] = useState("");
  const [localEvents, setLocalEvents] = useState<StoredCalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [undoToast, setUndoToast] = useState<UndoToastState | null>(null);
  const createConvexEvent = useMutation(api.calendar_events.create);
  const updateConvexEvent = useMutation(api.calendar_events.update);
  const removeConvexEvent = useMutation(api.calendar_events.remove);
  const restoreConvexEvent = useMutation(api.calendar_events.restore);
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const authState = getAddEventAuthState({ isAuthenticated, isLoading: isAuthLoading });
  const isAuthWaiting = eventSourceMode === "convex" && authState === "wait";

  useEffect(() => {
    if (eventSourceMode === "local") {
      setLocalEvents(loadCalendarEvents());
    }
  }, [eventSourceMode]);

  const selectedDate = useMemo(() => parseDateInputValue(selectedDateValue), [selectedDateValue]);
  const range = useMemo(
    () => getCalendarRangeMs(view, selectedDate ?? new Date()),
    [selectedDate, view]
  );
  // listInRange / listDueInRange call requireUser, which THROWS while the backend identity or the
  // user row isn't ready (e.g. during sign-in). getProfile returns null instead, so subscribe to the
  // lists only once it has resolved a user; until then the page shows its loading state, not an error.
  const profile = useQuery(
    api.users.getProfile,
    eventSourceMode === "convex" && isAuthenticated ? {} : "skip"
  );
  const hasConvexUser = eventSourceMode === "convex" && isAuthenticated && profile != null;
  const convexEvents = useQuery(
    api.calendar_events.listInRange,
    hasConvexUser ? { startMs: range.startMs, endMs: range.endMs } : "skip"
  );
  const dueTasks = useQuery(
    api.tasks.listDueInRange,
    hasConvexUser ? { startMs: range.startMs, endMs: range.endMs } : "skip"
  );
  const events = useMemo<DisplayCalendarEvent[]>(() => {
    if (eventSourceMode === "local") {
      return localEvents;
    }

    return (convexEvents ?? []).map((event) => ({
      id: event._id,
      title: event.title,
      startsAtMs: event.startsAtMs,
    }));
  }, [convexEvents, eventSourceMode, localEvents]);
  const visibleEvents = useMemo(() => getEventsInRange(events, range), [events, range]);
  const isLoading =
    eventSourceMode === "convex" &&
    (isAuthLoading ||
      (isAuthenticated && profile === undefined) ||
      (hasConvexUser && (convexEvents === undefined || dueTasks === undefined)));

  const handleExpireToast = useCallback(() => setUndoToast(null), []);
  const rowActions = useMemo<EventRowActions | undefined>(() => {
    if (eventSourceMode !== "convex") return undefined;
    return {
      onUpdate: async (event: EventRowEvent, patch) => {
        await updateConvexEvent({
          eventId: event.id as Id<"calendarEvents">,
          title: patch.title,
          startsAtMs: patch.startsAtMs,
        });
      },
      onDelete: async (event: EventRowEvent) => {
        const result = await removeConvexEvent({ eventId: event.id as Id<"calendarEvents"> });
        setUndoToast({ eventId: event.id, title: event.title, undoUntilMs: result.undoUntilMs });
      },
    };
  }, [eventSourceMode, removeConvexEvent, updateConvexEvent]);

  async function handleUndo() {
    if (!undoToast) return;
    const result = await restoreConvexEvent({ eventId: undoToast.eventId as Id<"calendarEvents"> });
    if (!result.success) {
      throw new Error("That event can no longer be restored.");
    }
    setUndoToast(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const startsAtMs = fromDateInputValue(selectedDateValue).getTime();
      const cleanTitle = title.trim();
      if (!cleanTitle) {
        throw new Error("Give the event a gentle label first.");
      }

      setIsSubmitting(true);
      if (eventSourceMode === "local") {
        const created = createLocalCalendarEvent({
          title: cleanTitle,
          startsAtMs,
        });
        const nextEvents = [...localEvents, created].toSorted(
          (a, b) => a.startsAtMs - b.startsAtMs
        );
        saveCalendarEvents(nextEvents);
        setLocalEvents(nextEvents);
      } else {
        if (authState !== "ready") {
          setIsSubmitting(false);
          if (authState === "signed-out") setError(SIGNED_OUT_MESSAGE);
          return;
        }
        try {
          await createConvexEvent({ title: cleanTitle, startsAtMs });
        } catch (createErr) {
          setError(toAddEventErrorMessage(createErr));
          return;
        }
      }
      setTitle("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not add that event yet.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 md:p-8">
      <header className="space-y-3">
        <p className="font-eyebrow text-muted-foreground">Calendar</p>
        <h1 className="text-h1 font-serif">One source for every calendar view</h1>
        <p className="max-w-2xl text-body leading-relaxed text-muted-foreground">
          Add an event once, then switch between Day, Week, and Month without losing the thread.
        </p>
      </header>

      <form
        className="grid gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft md:grid-cols-[1fr_12rem_auto]"
        onSubmit={handleSubmit}
      >
        <label className="flex flex-col gap-2 text-small font-medium text-foreground">
          Event title
          <input
            className="rounded-2xl border border-border bg-background px-4 py-3 text-body outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            name="title"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Planning call"
            value={title}
          />
        </label>

        <label className="flex flex-col gap-2 text-small font-medium text-foreground">
          Event date
          <input
            className="rounded-2xl border border-border bg-background px-4 py-3 text-body outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            name="date"
            onChange={(event) => setSelectedDateValue(event.target.value)}
            type="date"
            value={selectedDateValue}
          />
        </label>

        <div className="flex flex-col justify-end">
          <button
            className="min-h-11 rounded-2xl bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
            disabled={isSubmitting || isAuthWaiting}
            type="submit"
          >
            {isAuthWaiting ? "One moment…" : isSubmitting ? "Adding..." : "Add event"}
          </button>
        </div>

        {error ? (
          <p className="text-small text-destructive md:col-span-3" role="alert">
            {error}
            {error === SIGNED_OUT_MESSAGE ? (
              <>
                {" "}
                <a className="underline" href="/sign-in?redirect=/calendar">
                  Sign in
                </a>
              </>
            ) : null}
          </p>
        ) : null}
      </form>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-muted/40 p-4">
        <fieldset className="flex flex-wrap gap-2 border-0 p-0">
          <legend className="sr-only">Calendar views</legend>
          {viewOptions.map((option) => (
            <button
              aria-pressed={view === option.mode}
              className={`min-h-11 rounded-2xl px-4 py-2 text-small font-medium transition ${
                view === option.mode
                  ? "bg-foreground text-background"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
              key={option.mode}
              onClick={() => setView(option.mode)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </fieldset>
        <p className="text-small text-muted-foreground">{formatRange(view, range)}</p>
      </section>

      {isLoading ? (
        <section className="rounded-3xl border border-border bg-card/80 p-5 shadow-soft">
          <div className="h-4 w-28 animate-pulse rounded-full bg-muted" />
          <div className="mt-4 h-20 animate-pulse rounded-2xl bg-muted" />
        </section>
      ) : (
        <>
          <EventList actions={rowActions} events={visibleEvents} mode={view} />
          {hasConvexUser ? <DueTaskList tasks={dueTasks ?? []} /> : null}
        </>
      )}
      {undoToast ? (
        <UndoToast onExpire={handleExpireToast} onUndo={handleUndo} toast={undoToast} />
      ) : null}
    </main>
  );
}
