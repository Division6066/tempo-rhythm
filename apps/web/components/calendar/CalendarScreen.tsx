"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { api } from "@/convex/_generated/api";
import {
  buildCalendarRange,
  buildMonthGrid,
  buildWeekDays,
  layoutOverlappingEvents,
  minutesToMs,
  moveEventByMinutes,
  toMinuteOfDay,
  type CalendarEventLike,
  type CalendarRangeView,
  type CalendarView,
} from "@/lib/calendar/date-math";

type CalendarEvent = CalendarEventLike & {
  source: "manual" | "task" | "auto_schedule_proposal";
};

type ViewOption = {
  id: CalendarView;
  label: string;
};

const viewOptions: ViewOption[] = [
  { id: "today", label: "Today agenda" },
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "planner", label: "Planner" },
];

const storageKey = "tempo.calendar.demoEvents.v1";
const anchorMs = new Date(2026, 6, 14, 12).getTime();

const seedEvents: CalendarEvent[] = [
  {
    id: "focus-sprint",
    title: "Focus Sprint",
    source: "manual",
    startAt: new Date(2026, 6, 14, 9, 0).getTime(),
    endAt: new Date(2026, 6, 14, 10, 0).getTime(),
  },
  {
    id: "planning-review",
    title: "Planning review",
    source: "manual",
    startAt: new Date(2026, 6, 14, 9, 30).getTime(),
    endAt: new Date(2026, 6, 14, 10, 30).getTime(),
  },
];

function formatTime(ms: number): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(ms);
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readStoredEvents(): CalendarEvent[] {
  if (typeof window === "undefined") {
    return seedEvents;
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as CalendarEvent[]) : seedEvents;
  } catch {
    return seedEvents;
  }
}

function writeStoredEvents(events: CalendarEvent[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(events));
  } catch {
    // Local preview persistence is best-effort; authenticated users persist in Convex.
  }
}

function startAtFromTime(value: string): number {
  const [hours = "9", minutes = "0"] = value.split(":");
  return new Date(
    2026,
    6,
    14,
    Number.parseInt(hours, 10),
    Number.parseInt(minutes, 10),
  ).getTime();
}

function CalendarEventCard({
  event,
  onMove,
}: {
  event: CalendarEvent;
  onMove: (event: CalendarEvent, minutes: number) => void;
}) {
  return (
    <button
      type="button"
      data-testid={`calendar-event-${slugify(event.title)}`}
      onKeyDown={(eventKey) => {
        if (eventKey.key === "ArrowDown") {
          eventKey.preventDefault();
          onMove(event, 30);
        }
        if (eventKey.key === "ArrowUp") {
          eventKey.preventDefault();
          onMove(event, -30);
        }
      }}
      className="w-full rounded-lg border border-border bg-card p-3 text-left shadow-whisper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="block font-medium text-small">{event.title}</span>
      <span className="mt-1 block text-caption text-muted-foreground">
        {formatTime(event.startAt)}-{formatTime(event.endAt)} · {event.source}
      </span>
    </button>
  );
}

function DayColumn({
  events,
  onMove,
}: {
  events: CalendarEvent[];
  onMove: (event: CalendarEvent, minutes: number) => void;
}) {
  const laidOut = layoutOverlappingEvents(events);

  if (laidOut.length === 0) {
    return (
      <SoftCard tone="sunken" padding="md">
        <h3 className="font-eyebrow">Empty state</h3>
        <p className="mt-2 text-small text-muted-foreground">
          No calendar blocks here yet. Try turning one task into a gentle time block.
        </p>
      </SoftCard>
    );
  }

  return (
    <div className="space-y-3">
      {laidOut.map((event) => (
        <div
          key={event.id}
          className="grid gap-2 rounded-xl border border-border-soft bg-surface-sunken p-2"
          style={{
            gridTemplateColumns: `repeat(${event.laneCount}, minmax(0, 1fr))`,
          }}
        >
          <div style={{ gridColumnStart: event.lane + 1 }}>
            <CalendarEventCard event={event} onMove={onMove} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CalendarScreen() {
  const [activeView, setActiveView] = useState<CalendarView>("today");
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(seedEvents);
  const [taskTitle, setTaskTitle] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [showProposal, setShowProposal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");
  const hasConvexUser = profile != null;
  const range = buildCalendarRange(
    (activeView === "planner" ? "day" : activeView) as CalendarRangeView,
    anchorMs,
  );
  const remoteEvents = useQuery(
    api.calendar_events.list,
    isAuthenticated && hasConvexUser
      ? { startMs: range.startMs, endMs: range.endMs }
      : "skip",
  );
  const createBlock = useMutation(api.calendar_events.createBlock);
  const reschedule = useMutation(api.calendar_events.reschedule);

  useEffect(() => {
    setLocalEvents(readStoredEvents());
  }, []);

  const normalizedRemoteEvents = useMemo<CalendarEvent[]>(() => {
    return (remoteEvents ?? []).map((event) => ({
      id: event._id,
      title: event.title,
      source: event.source,
      startAt: event.startAt,
      endAt: event.endAt,
    }));
  }, [remoteEvents]);

  const eventSource =
    isAuthenticated && hasConvexUser ? normalizedRemoteEvents : localEvents;

  const visibleEvents = eventSource
    .filter((event) => event.startAt < range.endMs && event.endAt > range.startMs)
    .sort((a, b) => a.startAt - b.startAt);

  const isLoading =
    isAuthenticated && (profile === undefined || (hasConvexUser && remoteEvents === undefined));

  async function handleAddTaskBlock() {
    const title = taskTitle.trim();
    if (!title) {
      setErrorMessage("Add a task title first.");
      return;
    }

    const startAt = startAtFromTime(startTime);
    const nextEvent: CalendarEvent = {
      id: slugify(title),
      title,
      source: "task",
      startAt,
      endAt: startAt + minutesToMs(45),
    };

    setErrorMessage(null);
    if (isAuthenticated && hasConvexUser) {
      try {
        await createBlock({
          title,
          startAt: nextEvent.startAt,
          endAt: nextEvent.endAt,
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Could not add the block.");
      }
    } else {
      const next = [...localEvents.filter((event) => event.id !== nextEvent.id), nextEvent];
      setLocalEvents(next);
      writeStoredEvents(next);
    }
  }

  async function handleMove(event: CalendarEvent, minutes: number) {
    const moved = moveEventByMinutes(event, minutes);
    if (isAuthenticated && hasConvexUser) {
      try {
        await reschedule({
          eventId: event.id as never,
          startAt: moved.startAt,
          endAt: moved.endAt,
        });
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Could not reschedule the block.",
        );
      }
      return;
    }

    const next = localEvents.map((item) => (item.id === event.id ? moved : item));
    setLocalEvents(next);
    writeStoredEvents(next);
  }

  const weekDays = buildWeekDays(anchorMs);
  const monthGrid = buildMonthGrid(anchorMs);

  return (
    <div className="container mx-auto max-w-6xl px-6 py-10">
      <div className="space-y-6">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="orange">Calendar</Pill>
            <Pill tone="slate">Proposal-gated scheduling</Pill>
          </div>
          <div className="max-w-3xl space-y-2">
            <h1 className="text-h1 font-serif">Calendar</h1>
            <p className="text-body text-muted-foreground">
              Plan time visually without surprise changes. Day, week, month,
              and planner views all read from the same calendar event source.
            </p>
          </div>
        </header>

        {isLoading ? (
          <SoftCard data-testid="calendar-loading-state" tone="sunken" padding="lg">
            <div className="h-6 w-48 animate-pulse rounded-md bg-muted" />
            <div className="mt-4 h-32 animate-pulse rounded-xl bg-muted" />
          </SoftCard>
        ) : null}

        {errorMessage ? (
          <SoftCard data-testid="calendar-error-state" tone="inverse" padding="md">
            <p className="text-small">{errorMessage}</p>
          </SoftCard>
        ) : null}

        {!isLoading ? (
          <>
            <SoftCard padding="md" data-testid="calendar-event-source">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-eyebrow">Shared event source</h2>
                  <p className="mt-1 text-small text-muted-foreground">
                    {isAuthenticated && hasConvexUser
                      ? "Convex-owned calendar events are loaded for this signed-in user."
                      : "Local preview events are shown until sign-in; authenticated changes persist in Convex."}
                  </p>
                </div>
                <span className="rounded-full bg-surface-sunken px-3 py-1 text-caption">
                  {visibleEvents.length} visible blocks
                </span>
              </div>
            </SoftCard>

            <div
              role="tablist"
              aria-label="Calendar variants"
              className="flex flex-wrap gap-2"
            >
              {viewOptions.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  role="tab"
                  aria-selected={activeView === view.id}
                  onClick={() => setActiveView(view.id)}
                  className={[
                    "rounded-full border px-4 py-2 text-small transition-colors",
                    activeView === view.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-surface-sunken",
                  ].join(" ")}
                >
                  {view.label}
                </button>
              ))}
            </div>

            <SoftCard padding="lg">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 data-testid="calendar-active-view" className="text-h2 font-serif">
                    {viewOptions.find((view) => view.id === activeView)?.label}
                  </h2>
                  <p className="mt-1 text-small text-muted-foreground">
                    Use Tab to focus a block, then ArrowDown or ArrowUp to move it by 30 minutes.
                  </p>
                </div>
                <Button variant="soft" size="sm" onClick={() => setShowProposal(true)}>
                  Preview auto-schedule
                </Button>
              </div>

              {activeView === "month" ? (
                <section
                  data-testid="calendar-month-grid"
                  className="grid grid-cols-7 gap-2"
                  aria-label="Month view"
                >
                  {monthGrid.map((day) => {
                    const dayEvents = eventSource.filter(
                      (event) => event.startAt >= day.startMs && event.startAt < day.endMs,
                    );
                    return (
                      <button
                        key={day.isoDate}
                        type="button"
                        className={[
                          "min-h-24 rounded-xl border p-2 text-left text-small",
                          day.isCurrentMonth
                            ? "border-border bg-card"
                            : "border-border-soft bg-surface-sunken text-muted-foreground",
                          day.isToday ? "ring-2 ring-primary" : "",
                        ].join(" ")}
                      >
                        <span className="font-medium">{day.label}</span>
                        {dayEvents.map((event) => (
                          <span key={event.id} className="mt-2 block truncate text-caption">
                            {event.title}
                          </span>
                        ))}
                      </button>
                    );
                  })}
                </section>
              ) : null}

              {activeView === "week" ? (
                <section className="grid gap-3 md:grid-cols-7" aria-label="Week view">
                  {weekDays.map((day) => (
                    <SoftCard key={day.isoDate} tone="sunken" padding="sm">
                      <h3 className="font-eyebrow">{day.label}</h3>
                      <div className="mt-3 space-y-2">
                        {eventSource
                          .filter(
                            (event) => event.startAt >= day.startMs && event.startAt < day.endMs,
                          )
                          .map((event) => (
                            <CalendarEventCard key={event.id} event={event} onMove={handleMove} />
                          ))}
                      </div>
                    </SoftCard>
                  ))}
                </section>
              ) : null}

              {activeView === "today" || activeView === "day" || activeView === "planner" ? (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <section aria-label="Day view">
                    <DayColumn events={visibleEvents} onMove={handleMove} />
                  </section>
                  <aside className="space-y-4">
                    <SoftCard tone="sunken" padding="md">
                      <h3 className="font-eyebrow">Time-block planner</h3>
                      <div className="mt-4 space-y-3">
                        <label className="block text-small font-medium" htmlFor="calendar-task-title">
                          Task title
                        </label>
                        <input
                          id="calendar-task-title"
                          value={taskTitle}
                          onChange={(event) => setTaskTitle(event.currentTarget.value)}
                          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-small"
                        />
                        <label className="block text-small font-medium" htmlFor="calendar-start-time">
                          Start time
                        </label>
                        <input
                          id="calendar-start-time"
                          type="time"
                          value={startTime}
                          onChange={(event) => setStartTime(event.currentTarget.value)}
                          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-small"
                        />
                        <Button className="w-full" size="sm" onClick={handleAddTaskBlock}>
                          Turn task into block
                        </Button>
                      </div>
                    </SoftCard>
                    <SoftCard padding="md">
                      <h3 className="font-eyebrow">Overlap rendering proof</h3>
                      <p className="mt-2 text-small text-muted-foreground">
                        Blocks that overlap share a row with separate lanes instead of hiding each other.
                      </p>
                      <p className="mt-3 text-caption text-muted-foreground">
                        First block starts at minute {toMinuteOfDay(visibleEvents[0]?.startAt ?? anchorMs)}.
                      </p>
                    </SoftCard>
                  </aside>
                </div>
              ) : null}
            </SoftCard>
          </>
        ) : null}
      </div>

      {showProposal ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Auto-schedule proposal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
        >
          <SoftCard padding="lg" className="max-w-md">
            <h2 className="text-h2 font-serif">Auto-schedule proposal</h2>
            <p className="mt-3 text-small text-muted-foreground">
              Nothing moved yet. Tempo will show proposed calendar blocks here
              and wait for your accept, edit, or reject choice before saving.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setShowProposal(false)}>
                Accept proposal
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowProposal(false)}>
                Reject
              </Button>
            </div>
          </SoftCard>
        </div>
      ) : null}
    </div>
  );
}
