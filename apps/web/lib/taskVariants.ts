export const taskStatuses = ["todo", "in_progress", "done", "cancelled"] as const;
export const taskPriorities = ["high", "medium", "low"] as const;
export const taskEnergyLevels = ["low", "medium", "high"] as const;
export const recurrenceFrequencies = ["daily", "weekly", "monthly"] as const;

export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];
export type TaskEnergy = (typeof taskEnergyLevels)[number];
export type RecurrenceFrequency = (typeof recurrenceFrequencies)[number];

export type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
};

export type Recurrence = {
  frequency: RecurrenceFrequency;
  interval: number;
  nextDueAt: number;
};

export type TaskVariantRecord = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: number;
  projectKey?: string;
  energyLevel?: TaskEnergy;
  checklist?: ChecklistItem[];
  recurrence?: Recurrence;
};

export type TaskVariant =
  | "all"
  | "today"
  | "project"
  | "priority"
  | "energy"
  | "kanban"
  | "recurring"
  | "checklists";

export type DayBounds = {
  startMs: number;
  endMs: number;
};

export const variantLabels: Record<TaskVariant, string> = {
  all: "All tasks",
  today: "Today",
  project: "Project",
  priority: "Priority",
  energy: "Energy",
  kanban: "Kanban",
  recurring: "Recurring",
  checklists: "Checklists",
};

export const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "Doing",
  done: "Done",
  cancelled: "Cancelled",
};

export const priorityLabels: Record<TaskPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const energyLabels: Record<TaskEnergy, string> = {
  low: "Low energy",
  medium: "Medium energy",
  high: "High energy",
};

export function normalizeProjectKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isTaskDueToday(task: Pick<TaskVariantRecord, "dueAt">, bounds: DayBounds): boolean {
  return task.dueAt !== undefined && task.dueAt >= bounds.startMs && task.dueAt < bounds.endMs;
}

export function filterTasksForVariant(
  tasks: TaskVariantRecord[],
  variant: TaskVariant,
  options: {
    bounds?: DayBounds;
    projectKey?: string;
  } = {}
): TaskVariantRecord[] {
  const projectKey = options.projectKey ? normalizeProjectKey(options.projectKey) : undefined;

  return tasks.filter((task) => {
    if (variant === "today") {
      return options.bounds ? isTaskDueToday(task, options.bounds) : false;
    }

    if (variant === "project") {
      return projectKey
        ? normalizeProjectKey(task.projectKey ?? "") === projectKey
        : Boolean(task.projectKey);
    }

    if (variant === "recurring") {
      return task.recurrence !== undefined;
    }

    if (variant === "checklists") {
      return (task.checklist?.length ?? 0) > 0;
    }

    return true;
  });
}

export function groupTasksByPriority(
  tasks: TaskVariantRecord[]
): Record<TaskPriority, TaskVariantRecord[]> {
  return {
    high: tasks.filter((task) => task.priority === "high"),
    medium: tasks.filter((task) => task.priority === "medium"),
    low: tasks.filter((task) => task.priority === "low"),
  };
}

export function groupTasksByEnergy(
  tasks: TaskVariantRecord[]
): Record<TaskEnergy, TaskVariantRecord[]> {
  return {
    low: tasks.filter((task) => (task.energyLevel ?? "medium") === "low"),
    medium: tasks.filter((task) => (task.energyLevel ?? "medium") === "medium"),
    high: tasks.filter((task) => (task.energyLevel ?? "medium") === "high"),
  };
}

export function groupTasksByStatus(
  tasks: TaskVariantRecord[]
): Record<TaskStatus, TaskVariantRecord[]> {
  return {
    todo: tasks.filter((task) => task.status === "todo"),
    in_progress: tasks.filter((task) => task.status === "in_progress"),
    done: tasks.filter((task) => task.status === "done"),
    cancelled: tasks.filter((task) => task.status === "cancelled"),
  };
}

export function getChecklistProgress(items: ChecklistItem[] | undefined): {
  completed: number;
  total: number;
  percent: number;
} {
  const total = items?.length ?? 0;
  if (total === 0) {
    return { completed: 0, total: 0, percent: 0 };
  }

  const completed = items?.filter((item) => item.completed).length ?? 0;
  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
  };
}

export function getNextOccurrenceMs(
  fromMs: number,
  recurrence: Pick<Recurrence, "frequency" | "interval">
): number {
  const interval = Math.max(1, Math.floor(recurrence.interval));
  const next = new Date(fromMs);

  if (recurrence.frequency === "daily") {
    next.setDate(next.getDate() + interval);
  } else if (recurrence.frequency === "weekly") {
    next.setDate(next.getDate() + interval * 7);
  } else {
    next.setMonth(next.getMonth() + interval);
  }

  return next.getTime();
}
