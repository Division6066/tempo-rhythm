"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Columns3,
  FolderKanban,
  ListChecks,
  Plus,
  Repeat2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
  type ChecklistItem,
  energyLabels,
  filterTasksForVariant,
  getChecklistProgress,
  getNextOccurrenceMs,
  groupTasksByEnergy,
  groupTasksByPriority,
  groupTasksByStatus,
  normalizeProjectKey,
  priorityLabels,
  type RecurrenceFrequency,
  recurrenceFrequencies,
  statusLabels,
  type TaskEnergy,
  type TaskPriority,
  type TaskStatus,
  type TaskVariant,
  type TaskVariantRecord,
  taskEnergyLevels,
  taskPriorities,
  taskStatuses,
  variantLabels,
} from "@/lib/taskVariants";
import { useLocalDayBounds } from "@/lib/useLocalDayBounds";
import { cn } from "@/lib/utils";

type TasksScreenProps = {
  defaultView?: TaskVariant;
  projectKey?: string;
};

type NewTaskDraft = {
  title: string;
  projectKey: string;
  priority: TaskPriority;
  energyLevel: TaskEnergy;
  duePreset: "none" | "today";
  checklistText: string;
  recurrenceFrequency: "" | RecurrenceFrequency;
};

const orderedVariants: TaskVariant[] = [
  "all",
  "today",
  "project",
  "priority",
  "energy",
  "kanban",
  "recurring",
  "checklists",
];

const variantIcons: Record<TaskVariant, typeof ListChecks> = {
  all: ListChecks,
  today: CalendarDays,
  project: FolderKanban,
  priority: CheckCircle2,
  energy: Circle,
  kanban: Columns3,
  recurring: Repeat2,
  checklists: ListChecks,
};

function toVariantRecord(task: Doc<"tasks">): TaskVariantRecord {
  return {
    id: task._id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    dueAt: task.dueAt,
    projectKey: task.projectKey,
    energyLevel: task.energyLevel,
    checklist: task.checklist,
    recurrence: task.recurrence,
  };
}

function getVisibleView(value: string | null, fallback: TaskVariant): TaskVariant {
  return orderedVariants.includes(value as TaskVariant) ? (value as TaskVariant) : fallback;
}

function getTaskDueLabel(task: Doc<"tasks">): string {
  if (task.dueAt === undefined) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(task.dueAt));
}

function makeChecklistItems(text: string): ChecklistItem[] | undefined {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return undefined;
  }

  return lines.map((line, index) => ({
    id: globalThis.crypto?.randomUUID?.() ?? `check-${Date.now()}-${index}`,
    text: line,
    completed: false,
  }));
}

function EmptyState({ view }: { view: TaskVariant }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
      <p className="font-heading text-xl font-semibold text-foreground">
        No tasks in {variantLabels[view]} yet.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Add one small next step, or switch views to see what is already here.
      </p>
    </div>
  );
}

function NewTaskForm({ todayDueAt, projectKey }: { todayDueAt: number; projectKey?: string }) {
  const createTask = useMutation(api.tasks.create);
  const [draft, setDraft] = useState<NewTaskDraft>({
    title: "",
    projectKey: projectKey ?? "",
    priority: "medium",
    energyLevel: "medium",
    duePreset: "none",
    checklistText: "",
    recurrenceFrequency: "",
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const title = draft.title.trim();
    if (!title) {
      setMessage("Add a short title so the task has a clear next step.");
      return;
    }

    const dueAt = draft.duePreset === "today" ? todayDueAt : undefined;
    const recurrence = draft.recurrenceFrequency
      ? {
          frequency: draft.recurrenceFrequency,
          interval: 1,
          nextDueAt: getNextOccurrenceMs(dueAt ?? todayDueAt, {
            frequency: draft.recurrenceFrequency,
            interval: 1,
          }),
        }
      : undefined;

    setIsSubmitting(true);
    setMessage("");

    try {
      await createTask({
        title,
        priority: draft.priority,
        energyLevel: draft.energyLevel,
        projectKey: draft.projectKey,
        checklist: makeChecklistItems(draft.checklistText),
        recurrence,
        dueAt,
      });
      setDraft({
        title: "",
        projectKey: projectKey ?? "",
        priority: "medium",
        energyLevel: "medium",
        duePreset: "none",
        checklistText: "",
        recurrenceFrequency: "",
      });
      setMessage("Task added.");
    } catch {
      setMessage("Could not add that right now. Try again?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby="new-task-heading"
      className="rounded-3xl border border-border/80 bg-card/90 p-5 shadow-[0_10px_30px_rgba(26,25,23,0.08)]"
    >
      <div className="mb-4">
        <h2 id="new-task-heading" className="font-heading text-xl font-semibold text-foreground">
          Add a task
        </h2>
        <p className="text-sm text-muted-foreground">
          Optional fields make the same task appear in more views.
        </p>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1 text-sm font-medium text-foreground">
          Task title
          <input
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            className="min-h-11 rounded-xl border border-border bg-background px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-primary"
            placeholder="A concrete next step"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-foreground">
            Project
            <input
              value={draft.projectKey}
              onChange={(event) =>
                setDraft((current) => ({ ...current, projectKey: event.target.value }))
              }
              className="min-h-11 rounded-xl border border-border bg-background px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-primary"
              placeholder="alpha-launch"
            />
          </label>

          <label className="grid gap-1 text-sm font-medium text-foreground">
            Due
            <select
              value={draft.duePreset}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  duePreset: event.target.value as NewTaskDraft["duePreset"],
                }))
              }
              className="min-h-11 rounded-xl border border-border bg-background px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="none">No due date</option>
              <option value="today">Today</option>
            </select>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm font-medium text-foreground">
            Priority
            <select
              value={draft.priority}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  priority: event.target.value as TaskPriority,
                }))
              }
              className="min-h-11 rounded-xl border border-border bg-background px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-primary"
            >
              {taskPriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabels[priority]}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-medium text-foreground">
            Energy
            <select
              value={draft.energyLevel}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  energyLevel: event.target.value as TaskEnergy,
                }))
              }
              className="min-h-11 rounded-xl border border-border bg-background px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-primary"
            >
              {taskEnergyLevels.map((energy) => (
                <option key={energy} value={energy}>
                  {energyLabels[energy]}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-medium text-foreground">
            Repeat
            <select
              value={draft.recurrenceFrequency}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  recurrenceFrequency: event.target.value as NewTaskDraft["recurrenceFrequency"],
                }))
              }
              className="min-h-11 rounded-xl border border-border bg-background px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Not recurring</option>
              {recurrenceFrequencies.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {frequency}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-1 text-sm font-medium text-foreground">
          Checklist items
          <textarea
            value={draft.checklistText}
            onChange={(event) =>
              setDraft((current) => ({ ...current, checklistText: event.target.value }))
            }
            className="min-h-24 rounded-xl border border-border bg-background px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-primary"
            placeholder={"One item per line\nDraft the note\nSend the note"}
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={() => void submit()} disabled={isSubmitting}>
            <Plus className="h-4 w-4" aria-hidden />
            {isSubmitting ? "Adding..." : "Add task"}
          </Button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </div>
      </div>
    </section>
  );
}

function TaskCard({ task }: { task: Doc<"tasks"> }) {
  const toggleCompletion = useMutation(api.tasks.toggleCompletion);
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);
  const updateChecklistItem = useMutation(api.tasks.updateChecklistItem);
  const createNextOccurrence = useMutation(api.tasks.createNextOccurrence);
  const progress = getChecklistProgress(task.checklist);
  const isDone = task.status === "done";

  return (
    <article
      className={cn(
        "rounded-2xl border border-border/80 bg-background/75 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
        isDone && "opacity-75"
      )}
      data-task-title={task.title}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => void toggleCompletion({ taskId: task._id })}
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            isDone
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground"
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
            <h3
              className={cn(
                "font-medium text-foreground",
                isDone && "text-muted-foreground line-through"
              )}
            >
              {task.title}
            </h3>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {priorityLabels[task.priority]}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {energyLabels[task.energyLevel ?? "medium"]}
            </span>
            {task.projectKey ? (
              <Link
                href={`/projects/${task.projectKey}`}
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                {task.projectKey}
              </Link>
            ) : null}
          </div>

          {task.description ? (
            <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
          ) : null}

          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
              <select
                value={task.status}
                onChange={(event) =>
                  void updateTask({ taskId: task._id, status: event.target.value as TaskStatus })
                }
                className="min-h-10 rounded-xl border border-border bg-card px-2 text-sm font-normal normal-case text-foreground"
                aria-label={`Change status for ${task.title}`}
              >
                {taskStatuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Priority
              <select
                value={task.priority}
                onChange={(event) =>
                  void updateTask({
                    taskId: task._id,
                    priority: event.target.value as TaskPriority,
                  })
                }
                className="min-h-10 rounded-xl border border-border bg-card px-2 text-sm font-normal normal-case text-foreground"
                aria-label={`Change priority for ${task.title}`}
              >
                {taskPriorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priorityLabels[priority]}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Energy
              <select
                value={task.energyLevel ?? "medium"}
                onChange={(event) =>
                  void updateTask({
                    taskId: task._id,
                    energyLevel: event.target.value as TaskEnergy,
                  })
                }
                className="min-h-10 rounded-xl border border-border bg-card px-2 text-sm font-normal normal-case text-foreground"
                aria-label={`Change energy for ${task.title}`}
              >
                {taskEnergyLevels.map((energy) => (
                  <option key={energy} value={energy}>
                    {energyLabels[energy]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{getTaskDueLabel(task)}</span>
            {task.recurrence ? (
              <span>
                Repeats {task.recurrence.frequency}; next{" "}
                {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
                  new Date(task.recurrence.nextDueAt)
                )}
              </span>
            ) : null}
            {progress.total > 0 ? (
              <span>
                Checklist {progress.completed}/{progress.total} ({progress.percent}%)
              </span>
            ) : null}
          </div>

          {task.checklist && task.checklist.length > 0 ? (
            <ul className="mt-3 space-y-2 rounded-xl border border-border/70 bg-card/55 p-3">
              {task.checklist.map((item) => (
                <li key={item.id}>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(event) =>
                        void updateChecklistItem({
                          taskId: task._id,
                          itemId: item.id,
                          completed: event.target.checked,
                        })
                      }
                      className="h-4 w-4"
                    />
                    <span className={cn(item.completed && "text-muted-foreground line-through")}>
                      {item.text}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {task.recurrence ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void createNextOccurrence({ taskId: task._id })}
              >
                <Repeat2 className="h-4 w-4" aria-hidden />
                Create next
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void removeTask({ taskId: task._id })}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function TaskList({ tasks, view }: { tasks: Doc<"tasks">[]; view: TaskVariant }) {
  if (tasks.length === 0) {
    return <EmptyState view={view} />;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} />
      ))}
    </div>
  );
}

function GroupSection({
  title,
  tasks,
  view,
}: {
  title: string;
  tasks: Doc<"tasks">[];
  view: TaskVariant;
}) {
  return (
    <section className="rounded-3xl border border-border/80 bg-card/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
        <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
          {tasks.length}
        </span>
      </div>
      <TaskList tasks={tasks} view={view} />
    </section>
  );
}

function VariantContent({
  tasks,
  records,
  view,
}: {
  tasks: Doc<"tasks">[];
  records: TaskVariantRecord[];
  view: TaskVariant;
}) {
  const byId = new Map(tasks.map((task) => [task._id, task]));

  if (view === "priority") {
    const groups = groupTasksByPriority(records);
    return (
      <div className="grid gap-4 xl:grid-cols-3">
        {taskPriorities.map((priority) => (
          <GroupSection
            key={priority}
            title={priorityLabels[priority]}
            tasks={groups[priority].flatMap((task) => {
              const row = byId.get(task.id as Id<"tasks">);
              return row ? [row] : [];
            })}
            view={view}
          />
        ))}
      </div>
    );
  }

  if (view === "energy") {
    const groups = groupTasksByEnergy(records);
    return (
      <div className="grid gap-4 xl:grid-cols-3">
        {taskEnergyLevels.map((energy) => (
          <GroupSection
            key={energy}
            title={energyLabels[energy]}
            tasks={groups[energy].flatMap((task) => {
              const row = byId.get(task.id as Id<"tasks">);
              return row ? [row] : [];
            })}
            view={view}
          />
        ))}
      </div>
    );
  }

  if (view === "kanban") {
    const groups = groupTasksByStatus(records);
    return (
      <div className="grid gap-4 xl:grid-cols-4">
        {taskStatuses.map((status) => (
          <GroupSection
            key={status}
            title={statusLabels[status]}
            tasks={groups[status].flatMap((task) => {
              const row = byId.get(task.id as Id<"tasks">);
              return row ? [row] : [];
            })}
            view={view}
          />
        ))}
      </div>
    );
  }

  return <TaskList tasks={tasks} view={view} />;
}

export function TasksScreen({ defaultView = "all", projectKey }: TasksScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const bounds = useLocalDayBounds();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");
  const hasConvexUser = profile != null;
  const listArgs = projectKey ? { projectKey } : {};
  const tasks = useQuery(api.tasks.list, isAuthenticated && hasConvexUser ? listArgs : "skip");
  const view = getVisibleView(searchParams.get("view"), projectKey ? defaultView : defaultView);
  const normalizedProjectKey = projectKey ? normalizeProjectKey(projectKey) : undefined;

  const visibleRecords = useMemo(() => {
    if (!tasks) {
      return [];
    }

    return filterTasksForVariant(tasks.map(toVariantRecord), view, {
      bounds,
      projectKey: normalizedProjectKey,
    });
  }, [bounds, normalizedProjectKey, tasks, view]);

  const visibleIds = useMemo(
    () => new Set(visibleRecords.map((task) => task.id)),
    [visibleRecords]
  );
  const visibleTasks = useMemo(
    () => tasks?.filter((task) => visibleIds.has(task._id)) ?? [],
    [tasks, visibleIds]
  );
  const isLoading =
    isAuthLoading ||
    (isAuthenticated && (profile === undefined || (hasConvexUser && tasks === undefined)));

  const setView = (nextView: TaskVariant) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", nextView);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-6">
          <div className="h-12 w-72 animate-pulse rounded-xl bg-muted" />
          <div className="h-64 animate-pulse rounded-[2rem] bg-muted" />
          <div className="h-80 animate-pulse rounded-[2rem] bg-muted" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !profile || !tasks) {
    return (
      <div className="container mx-auto max-w-5xl px-6 py-16 text-center">
        <SoftCard className="mx-auto max-w-xl">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Sign in required</h1>
          <p className="mt-3 text-muted-foreground">
            We could not load your task views. Sign in again to pick up where you left off.
          </p>
          <Button asChild className="mt-6">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </SoftCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <div className="space-y-6">
        <header className="rounded-[2rem] border border-border/80 bg-card/90 p-6 shadow-[0_10px_30px_rgba(26,25,23,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Task variants
          </p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-heading text-4xl font-semibold text-foreground">
                {projectKey ? `Project ${normalizeProjectKey(projectKey)}` : "Tasks"}
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Same task records, different ways to find the next workable step.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {visibleTasks.length} of {tasks.length} task{tasks.length === 1 ? "" : "s"}.
            </p>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] xl:items-start">
          <div className="space-y-4">
            <nav
              className="grid gap-2 rounded-3xl border border-border/80 bg-card/80 p-3"
              aria-label="Task variants"
            >
              {orderedVariants.map((variant) => {
                const Icon = variantIcons[variant];
                return (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => setView(variant)}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      view === variant
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    aria-current={view === variant ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {variantLabels[variant]}
                  </button>
                );
              })}
            </nav>

            <NewTaskForm todayDueAt={bounds.endMs - 1} projectKey={normalizedProjectKey} />
          </div>

          <section
            aria-labelledby="task-variant-heading"
            className="rounded-[2rem] border border-border/80 bg-card/90 p-5 shadow-[0_10px_30px_rgba(26,25,23,0.08)]"
          >
            <div className="mb-5">
              <h2
                id="task-variant-heading"
                className="font-heading text-2xl font-semibold text-foreground"
              >
                {variantLabels[view]}
              </h2>
              <p className="text-sm text-muted-foreground">
                {view === "recurring"
                  ? "Use Create next when you are ready to add the next occurrence."
                  : view === "kanban"
                    ? "Move cards by changing their status; the column persists on reload."
                    : "Updates save back to the task record."}
              </p>
            </div>

            <VariantContent tasks={visibleTasks} records={visibleRecords} view={view} />
          </section>
        </div>
      </div>
    </div>
  );
}
