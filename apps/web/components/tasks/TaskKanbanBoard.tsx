"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { ArrowRight, GripVertical, KanbanSquare } from "lucide-react";
import { useMemo, useState } from "react";

type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
type TaskPriority = "low" | "medium" | "high";

type KanbanTask = {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: number;
};

type Column = {
  status: TaskStatus;
  title: string;
  empty: string;
};

const columns: Column[] = [
  {
    status: "todo",
    title: "To do",
    empty: "No waiting cards.",
  },
  {
    status: "in_progress",
    title: "In progress",
    empty: "Nothing actively moving right now.",
  },
  {
    status: "done",
    title: "Done",
    empty: "Completed cards will land here.",
  },
  {
    status: "cancelled",
    title: "Set aside",
    empty: "Cards you set aside stay visible here.",
  },
];

const priorityLabel: Record<TaskPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const priorityClass: Record<TaskPriority, string> = {
  high: "border-destructive/30 bg-destructive/10 text-destructive",
  medium: "border-primary/30 bg-primary/10 text-primary",
  low: "border-border bg-muted text-muted-foreground",
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

function nextStatus(status: TaskStatus): TaskStatus {
  const index = columns.findIndex((column) => column.status === status);
  return columns[Math.min(index + 1, columns.length - 1)]?.status ?? status;
}

export function TaskKanbanBoard() {
  const tasks = useQuery(api.tasks.list, {}) as KanbanTask[] | undefined;
  const moveStatus = useMutation(api.tasks.moveStatus);
  const [draggedTaskId, setDraggedTaskId] = useState<Id<"tasks"> | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Partial<Record<Id<"tasks">, TaskStatus>>>({});

  const visibleTasks = useMemo(
    () =>
      (tasks ?? []).map((task) => ({
        ...task,
        status: localStatuses[task._id] ?? task.status,
      })),
    [localStatuses, tasks],
  );

  async function moveTask(taskId: Id<"tasks">, status: TaskStatus) {
    const previousStatus = visibleTasks.find((task) => task._id === taskId)?.status;
    if (previousStatus === status) {
      return;
    }
    setLocalStatuses((current) => ({ ...current, [taskId]: status }));
    try {
      await moveStatus({ taskId, status });
    } catch (error) {
      setLocalStatuses((current) => {
        const next = { ...current };
        if (previousStatus) {
          next[taskId] = previousStatus;
        } else {
          delete next[taskId];
        }
        return next;
      });
      throw error;
    }
  }

  if (tasks === undefined) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-8">
        <p className="rounded-3xl border border-border bg-card p-6 text-muted-foreground">
          Loading your project board...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-primary">
          <KanbanSquare className="h-6 w-6" aria-hidden />
          <span className="text-sm font-semibold uppercase tracking-wide">Project board</span>
        </div>
        <div>
          <h1 className="font-heading text-4xl font-semibold text-foreground">Kanban</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Move a card when its real-world state changes. The board saves each move, so a refresh
            keeps the card in its new column.
          </p>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-4" aria-label="Task status columns">
        {columns.map((column) => {
          const columnTasks = visibleTasks.filter((task) => task.status === column.status);
          return (
            <div
              key={column.status}
              data-testid={`kanban-column-${column.status}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (draggedTaskId) {
                  void moveTask(draggedTaskId, column.status);
                  setDraggedTaskId(null);
                }
              }}
              className="min-h-80 rounded-3xl border border-border bg-card/80 p-4 shadow-[0_10px_30px_rgba(26,25,23,0.08)]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-heading text-xl font-semibold text-foreground">
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
                    const next = nextStatus(task.status);
                    return (
                      <li
                        key={task._id}
                        data-testid={`kanban-card-${task._id}`}
                        draggable
                        onDragStart={() => setDraggedTaskId(task._id)}
                        onDragEnd={() => setDraggedTaskId(null)}
                        className="rounded-2xl border border-border bg-background p-4 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <GripVertical
                            className="mt-1 h-4 w-4 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-foreground">{task.title}</h3>
                            {task.description ? (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {task.description}
                              </p>
                            ) : null}
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span
                                className={cn(
                                  "rounded-full border px-2 py-0.5 text-xs font-semibold",
                                  priorityClass[task.priority],
                                )}
                              >
                                {priorityLabel[task.priority]}
                              </span>
                              {dueLabel ? (
                                <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                                  Due {dueLabel}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {next !== task.status ? (
                          <button
                            type="button"
                            data-testid={`kanban-move-next-${task._id}`}
                            onClick={() => {
                              void moveTask(task._id, next);
                            }}
                            className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                          >
                            Move to {columns.find((item) => item.status === next)?.title}
                            <ArrowRight className="h-4 w-4" aria-hidden />
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
}
