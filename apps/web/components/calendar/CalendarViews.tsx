"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { api } from "@/convex/_generated/api";
import {
  fromDateInputValue,
  getCalendarRangeMs,
  getEventsInRange,
  parseDateInputValue,
  toDateInputValue,
  type CalendarViewMode,
} from "@/lib/calendar/date-math";
import {
  createLocalCalendarEvent,
  loadCalendarEvents,
  saveCalendarEvents,
  type StoredCalendarEvent,
} from "@/lib/calendar/event-source";

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

function EventList({
  events,
  mode,
}: {
  events: DisplayCalendarEvent[];
  mode: CalendarViewMode;
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
            <li
              className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3"
              key={event.id}
            >
              <p className="font-medium text-foreground">{event.title}</p>
              <p className="mt-1 text-caption text-muted-foreground">
                {new Date(event.startsAtMs).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </li>
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
  const createConvexEvent = useMutation(api.calendar_events.create);
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const profile = useQuery(
    api.users.getProfile,
    eventSourceMode === "convex" && isAuthenticated ? {} : "skip",
  );

  useEffect(() => {
    if (eventSourceMode === "local") {
      setLocalEvents(loadCalendarEvents());
    }
  }, [eventSourceMode]);

  const selectedDate = useMemo(() => parseDateInputValue(selectedDateValue), [selectedDateValue]);
  const range = useMemo(
    () => getCalendarRangeMs(view, selectedDate ?? new Date()),
    [selectedDate, view],
  );
  const hasConvexUser = eventSourceMode === "convex" && profile != null;
  const convexEvents = useQuery(
    api.calendar_events.listInRange,
    hasConvexUser ? { startMs: range.startMs, endMs: range.endMs } : "skip",
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
    (isAuthLoading || (isAuthenticated && (profile === undefined || convexEvents === undefined)));

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
        const nextEvents = [...localEvents, created].toSorted((a, b) => a.startsAtMs - b.startsAtMs);
        saveCalendarEvents(nextEvents);
        setLocalEvents(nextEvents);
      } else {
        if (!isAuthenticated || !profile) {
          throw new Error("Sign in again to add calendar events.");
        }
        await createConvexEvent({ title: cleanTitle, startsAtMs });
      }
      setTitle("");
      setView("day");
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
          Add an event once, then switch between Day, Week, and Month without losing the
          thread.
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
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Adding..." : "Add event"}
          </button>
        </div>

        {error ? (
          <p className="text-small text-destructive md:col-span-3" role="alert">
            {error}
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
        <EventList events={visibleEvents} mode={view} />
      )}
    </main>
  );
}
