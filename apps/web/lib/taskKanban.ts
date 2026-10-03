import { slugifyProjectName, type TaskStatus } from "./task-view-filters";

export const KANBAN_STATUSES = [
  "todo",
  "in_progress",
  "done",
  "cancelled",
] as const satisfies readonly TaskStatus[];

export type KanbanStatus = (typeof KANBAN_STATUSES)[number];

export type KanbanColumn = {
  status: KanbanStatus;
  title: string;
  empty: string;
};

export const KANBAN_COLUMNS: readonly KanbanColumn[] = [
  { status: "todo", title: "To do", empty: "Nothing waiting in this column." },
  {
    status: "in_progress",
    title: "In progress",
    empty: "Nothing actively moving right now.",
  },
  { status: "done", title: "Done", empty: "Finished cards will land here." },
  {
    status: "cancelled",
    title: "Set aside",
    empty: "Cards you set aside stay visible here.",
  },
];

export function nextKanbanStatus(status: TaskStatus): TaskStatus {
  const index = KANBAN_STATUSES.indexOf(status as KanbanStatus);
  if (index < 0 || index >= KANBAN_STATUSES.length - 1) {
    return status;
  }
  return KANBAN_STATUSES[index + 1] ?? status;
}

export function projectIdFromSlug(projectSlug: string): string {
  return slugifyProjectName(projectSlug) || "home-reset";
}

export function tasksForProject<T extends { projectId?: string }>(
  tasks: readonly T[],
  projectSlug: string,
): T[] {
  const projectId = projectIdFromSlug(projectSlug);
  return tasks.filter((task) => task.projectId === projectId);
}

export function groupTasksByKanbanStatus<T extends { status: TaskStatus }>(
  tasks: readonly T[],
): Record<KanbanStatus, T[]> {
  const groups: Record<KanbanStatus, T[]> = {
    todo: [],
    in_progress: [],
    done: [],
    cancelled: [],
  };
  for (const task of tasks) {
    groups[task.status].push(task);
  }
  return groups;
}
