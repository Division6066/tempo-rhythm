"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { CheckCircle2, Circle, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
type TaskPriority = "low" | "medium" | "high";

type TaskRow = {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
};

const priorityClass: Record<TaskPriority, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-primary/10 text-primary border-primary/30",
  low: "bg-muted text-muted-foreground border-border",
};

const priorityLabel: Record<TaskPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const statusLabel: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  cancelled: "Cancelled",
};

const statusClass: Record<TaskStatus, string> = {
  todo: "bg-muted text-foreground border-border",
  in_progress: "bg-primary/10 text-primary border-primary/30",
  done: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-300",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export function TasksScreen() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const tasks = useQuery(api.tasks.list, isAuthenticated ? {} : "skip");

  if (isAuthLoading) {
    return <TasksSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-4xl px-6 py-16 text-center">
        <SoftCard className="mx-auto max-w-xl">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Sign in required</h1>
          <p className="mt-3 text-muted-foreground">
            Sign in to pick up your task list where you left off.
          </p>
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
          Tasks
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Everything on your plate — today, later, all of it. One small step at a time.
        </p>
      </header>

      <TaskQuickAdd />

      {tasks === undefined ? (
        <div className="mt-8">
          <TasksListSkeleton />
        </div>
      ) : tasks.length === 0 ? (
        <section className="mt-8 rounded-3xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <p className="text-base text-foreground">No tasks yet. Add your first one above.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Starting tiny still counts — a single line is enough.
          </p>
        </section>
      ) : (
        <TaskList tasks={tasks} />
      )}
    </div>
  );
}

function TaskQuickAdd() {
  const createQuick = useMutation(api.tasks.createQuick);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hint, setHint] = useState("");

  const submit = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setHint("Add a few words so you know what this is.");
      return;
    }

    setIsSubmitting(true);
    setHint("");

    try {
      await createQuick({ title: trimmed });
      setTitle("");
    } catch {
      setHint("Could not add that right now. Try again?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
      <div className="mb-3">
        <label htmlFor="tasks-quick-add" className="text-sm font-medium text-foreground">
          Add a task
        </label>
        <p className="mt-1 text-sm text-muted-foreground">
          No due date needed — just get it out of your head.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="tasks-quick-add"
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
          placeholder="Send invoice, book appointment, reply to Alex…"
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
              Adding…
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" aria-hidden />
              Add
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

function TaskList({ tasks }: { tasks: TaskRow[] }) {
  const toggleCompletion = useMutation(api.tasks.toggleCompletion);
  const active = tasks.filter((t) => t.status !== "done" && t.status !== "cancelled");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <section className="mt-8 space-y-8">
      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            {active.length > 0 ? "Open" : "All caught up"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {active.length} open · {done.length} done
          </p>
        </div>
        <ul className="space-y-3">
          {active.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onToggle={() => void toggleCompletion({ taskId: task._id })}
            />
          ))}
        </ul>
      </div>

      {done.length > 0 && (
        <div>
          <h2 className="mb-3 font-heading text-xl font-semibold text-muted-foreground">
            Done today
          </h2>
          <ul className="space-y-3">
            {done.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                onToggle={() => void toggleCompletion({ taskId: task._id })}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function TaskItem({ task, onToggle }: { task: TaskRow; onToggle: () => void }) {
  const isDone = task.status === "done";

  return (
    <li
      className={cn(
        "rounded-2xl border border-border/80 bg-background/70 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition",
        isDone && "opacity-75",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            isDone
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground",
          )}
          aria-label={isDone ? `Mark ${task.title} as not done` : `Mark ${task.title} complete`}
        >
          {isDone ? (
            <CheckCircle2 className="h-4 w-4" aria-hidden />
          ) : (
            <Circle className="h-4 w-4" aria-hidden />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "font-medium text-foreground",
                isDone && "text-muted-foreground line-through",
              )}
            >
              {task.title}
            </p>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
                priorityClass[task.priority],
              )}
            >
              {priorityLabel[task.priority]}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                statusClass[task.status],
              )}
            >
              {statusLabel[task.status]}
            </span>
          </div>

          {task.description ? (
            <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function TasksSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-6 py-12 space-y-6">
      <div className="h-12 w-48 animate-pulse rounded-xl bg-muted" />
      <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      <TasksListSkeleton />
    </div>
  );
}

function TasksListSkeleton() {
  return (
    <ul className="space-y-3">
      {[0, 1, 2].map((i) => (
        <li key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
      ))}
    </ul>
  );
}
