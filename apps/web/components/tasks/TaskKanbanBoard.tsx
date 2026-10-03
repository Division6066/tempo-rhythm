"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import {
  KANBAN_COLUMNS,
  groupTasksByKanbanStatus,
  nextKanbanStatus,
  projectIdFromSlug,
  tasksForProject,
} from "@/lib/taskKanban";
import { titleFromProjectSlug, type TaskPriority, type TaskStatus } from "@/lib/task-view-filters";
import { cn } from "@/lib/utils";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ArrowRight, KanbanSquare } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type KanbanTask = {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: number;
  projectId?: string;
};

const priorityLabel: Record<TaskPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

function formatDueAt(dueAt: number | undefined) {
  if (dueAt === undefined) {
    return null;
  }
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(dueAt));
}

export function TaskKanbanBoard({ projectSlug }: { projectSlug: string }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");
  const hasConvexUser = profile != null;
  const tasks = useQuery(
    api.tasks.list,
    isAuthenticated && hasConvexUser ? {} : "skip",
  );
  const updateTask = useMutation(api.tasks.update);
  const [draggedTaskId, setDraggedTaskId] = useState<Id<"tasks"> | null>(null);
  const [localStatuses, setLocalStatuses] = useState<
    Partial<Record<Id<"tasks">, TaskStatus>>
  >({});

  const projectId = projectIdFromSlug(projectSlug);
  const projectTitle = titleFromProjectSlug(projectId);

  const projectTasks = useMemo(() => {
    const rows = tasksForProject((tasks ?? []) as KanbanTask[], projectSlug);
    return rows.map((task) => ({
      ...task,
      status: localStatuses[task._id] ?? task.status,
    }));
  }, [localStatuses, projectSlug, tasks]);

  const grouped = useMemo(
    () => groupTasksByKanbanStatus(projectTasks),
    [projectTasks],
  );

  const isLoading =
    isAuthLoading ||
    (isAuthenticated &&
      (profile === undefined || (hasConvexUser && tasks === undefined)));

  async function moveTask(taskId: Id<"tasks">, status: TaskStatus) {
    const previousStatus = projectTasks.find((task) => task._id === taskId)?.status;
    if (previousStatus === status) {
      return;
    }
    setLocalStatuses((current) => ({ ...current, [taskId]: status }));
    try {
      await updateTask({ taskId, status });
    } catch {
      setLocalStatuses((current) => {
        const next = { ...current };
        if (previousStatus) {
          next[taskId] = previousStatus;
        } else {
          delete next[taskId];
        }
        return next;
      });
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-6xl p-8">
        <div className="space-y-4">
          <div className="h-12 w-56 animate-pulse rounded-xl bg-muted" />
          <div className="h-40 animate-pulse rounded-3xl bg-muted" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !profile || !tasks) {
    return (
      <main className="mx-auto w-full max-w-4xl p-8 text-center">
        <SoftCard className="mx-auto max-w-xl">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Project board
          </h1>
          <p className="mt-3 text-muted-foreground">
            Sign in again to move cards on this board.
          </p>
          <Button asChild className="mt-6">
            <Link href={`/sign-in?next=/projects/${projectSlug}/kanban`}>
              Sign in
            </Link>
          </Button>
        </SoftCard>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-primary">
          <KanbanSquare className="h-6 w-6" aria-hidden />
          <span className="text-sm font-semibold uppercase tracking-wide">
            Project board
          </span>
        </div>
        <div>
          <h1 className="font-heading text-4xl font-semibold text-foreground">
            {projectTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Move a card when its real-world state changes. The board saves each
            move, so a refresh keeps the card in its new column.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            <Link
              href={`/projects/${projectSlug}`}
              className="underline underline-offset-4"
            >
              Back to the project list
            </Link>
          </p>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-4" aria-label="Task status columns">
        {KANBAN_COLUMNS.map((column) => {
          const columnTasks = grouped[column.status];
          return (
            <section
              key={column.status}
              aria-labelledby={`kanban-column-${column.status}-heading`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (draggedTaskId) {
                  void moveTask(draggedTaskId, column.status);
                  setDraggedTaskId(null);
                }
              }}
              className="min-h-80 rounded-3xl border border-border bg-card/80 p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2
                  id={`kanban-column-${column.status}-heading`}
                  className="font-heading text-xl font-semibold text-foreground"
                >
                  {column.title}
                </h2>
                <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  {columnTasks.length}
                </span>
              </div>

              {columnTasks.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  {column.empty}
                </p>
              ) : (
                <ul className="space-y-3">
                  {columnTasks.map((task) => {
                    const dueLabel = formatDueAt(task.dueAt);
                    const next = nextKanbanStatus(task.status);
                    return (
                      <li
                        key={task._id}
                        draggable
                        onDragStart={() => setDraggedTaskId(task._id)}
                        onDragEnd={() => setDraggedTaskId(null)}
                        className="rounded-2xl border border-border bg-background p-4"
                      >
                        <div className="min-w-0">
                          <h3 className="font-medium text-foreground">{task.title}</h3>
                          {task.description ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          ) : null}
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                              {priorityLabel[task.priority]}
                            </span>
                            {dueLabel ? (
                              <span className="text-xs text-muted-foreground">
                                Due {dueLabel}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        {next !== task.status ? (
                          <button
                            type="button"
                            className={cn(
                              "mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                            )}
                            onClick={() => {
                              void moveTask(task._id, next);
                            }}
                          >
                            Move to {KANBAN_COLUMNS.find((item) => item.status === next)?.title}
                            <ArrowRight className="h-4 w-4" aria-hidden />
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </section>
    </main>
  );
}
