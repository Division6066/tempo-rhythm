"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import type React from "react";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

const blockDurationMinutes = 30;
const moveStepMs = 30 * 60_000;

function getCalendarWindow() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  const nineAm = new Date(start);
  nineAm.setHours(9, 0, 0, 0);

  return {
    startMs: start.getTime(),
    endMs: end.getTime(),
    defaultBlockStartMs: nineAm.getTime(),
  };
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function CalendarPlanner() {
  const [title, setTitle] = useState("");
  const [pendingTaskId, setPendingTaskId] = useState<Id<"tasks"> | null>(null);
  const [pendingEventId, setPendingEventId] = useState<Id<"calendarEvents"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calendarWindow = useMemo(() => getCalendarWindow(), []);
  const tasks = useQuery(api.tasks.list, { status: "todo" as TaskStatus }) ?? [];
  const events = useQuery(api.calendar.listRange, {
    startMs: calendarWindow.startMs,
    endMs: calendarWindow.endMs,
  }) ?? [];
  const createTask = useMutation(api.tasks.create);
  const createCalendarBlock = useMutation(api.calendar.createFromTask);
  const reschedule = useMutation(api.calendar.reschedule);

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Add a task title first.");
      return;
    }

    setError(null);
    const taskId = await createTask({
      title: trimmed,
      priority: "medium",
      status: "todo",
    });
    setTitle("");
    setPendingTaskId(taskId);
    window.setTimeout(() => setPendingTaskId(null), 700);
  }

  async function handleScheduleTask(taskId: Id<"tasks">) {
    setError(null);
    setPendingTaskId(taskId);
    try {
      await createCalendarBlock({
        taskId,
        startAt: calendarWindow.defaultBlockStartMs,
        durationMinutes: blockDurationMinutes,
      });
    } finally {
      setPendingTaskId(null);
    }
  }

  async function handleMoveLater(event: {
    _id: Id<"calendarEvents">;
    startAt: number;
    endAt: number;
    title: string;
  }) {
    setError(null);
    setPendingEventId(event._id);
    try {
      await reschedule({
        eventId: event._id,
        startAt: event.startAt + moveStepMs,
        endAt: event.endAt + moveStepMs,
      });
    } finally {
      setPendingEventId(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-8">
      <header className="space-y-3">
        <p className="font-eyebrow text-primary">Calendar</p>
        <h1 className="text-h1 font-serif">Calendar</h1>
        <p className="max-w-2xl text-body leading-relaxed text-muted-foreground">
          Turn a task into a calendar block, then move it when your day shifts.
          The update is saved to your Tempo calendar.
        </p>
      </header>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm" aria-labelledby="task-form-heading">
        <h2 id="task-form-heading" className="text-h3 font-serif">
          Start with a task
        </h2>
        <form onSubmit={handleCreateTask} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="min-w-0 flex-1">
            <label htmlFor="calendar-task-title" className="mb-2 block text-sm font-medium text-foreground">
              Task title
            </label>
            <input
              id="calendar-task-title"
              value={title}
              onChange={(event) => setTitle(event.currentTarget.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Write a small next step"
            />
          </div>
          <button
            type="submit"
            className="self-end rounded-2xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Add task
          </button>
        </form>
        {error ? (
          <p role="alert" className="mt-3 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-h3 font-serif">Tasks waiting to schedule</h2>
          {tasks.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
              No open tasks here yet. Add one above when you are ready.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {tasks.map((task) => (
                <li
                  key={task._id}
                  className={cn(
                    "rounded-2xl border border-border bg-background p-4 transition",
                    pendingTaskId === task._id && "border-primary",
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">{task.title}</p>
                      <p className="text-sm text-muted-foreground">Ready for a 30 minute calendar block.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        void handleScheduleTask(task._id);
                      }}
                      className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      disabled={pendingTaskId === task._id}
                    >
                      Schedule {task.title} at {formatTime(calendarWindow.defaultBlockStartMs)}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-h3 font-serif">Today's calendar blocks</h2>
          {events.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
              Nothing scheduled yet. You can turn a task into a block without locking in the whole day.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {events.map((event) => (
                <li
                  key={event._id}
                  data-testid="calendar-event"
                  className="rounded-2xl border border-primary/30 bg-primary/5 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(event.startAt)} – {formatTime(event.endAt)}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">
                        {event.isOwnedByCurrentUser ? "Owned by you" : "Ownership needs review"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        void handleMoveLater(event);
                      }}
                      className="rounded-xl border border-primary/30 bg-background px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      disabled={pendingEventId === event._id}
                    >
                      Move {event.title} 30 minutes later
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
