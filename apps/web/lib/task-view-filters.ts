export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";
export type TaskEnergy = "low" | "medium" | "high";
export type TaskView = "today" | "inbox" | "project" | "priority" | "energy";

export type TaskViewRecord = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  energy: TaskEnergy;
  projectId?: string;
  projectName?: string;
  dueAt?: number;
  updatedAt: number;
};

export type TaskViewFilter =
  | { view: "today"; todayStart: number; todayEnd: number }
  | { view: "project"; projectId: string }
  | { view: "inbox" | "priority" | "energy" };

export type TaskGroups = Record<TaskPriority, TaskViewRecord[]>;
export type EnergyGroups = Record<TaskEnergy, TaskViewRecord[]>;

export function slugifyProjectName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function titleFromProjectSlug(slug: string): string {
  const words = slug
    .split("-")
    .map((word) => word.trim())
    .filter(Boolean);

  if (words.length === 0) {
    return "Project";
  }

  return words.map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`).join(" ");
}

export function filterTasksForView(tasks: TaskViewRecord[], filter: TaskViewFilter): TaskViewRecord[] {
  const liveTasks = tasks.filter((task) => task.status !== "cancelled");

  const filtered = liveTasks.filter((task) => {
    if (filter.view === "today") {
      return (
        task.dueAt !== undefined &&
        task.dueAt >= filter.todayStart &&
        task.dueAt < filter.todayEnd
      );
    }

    if (filter.view === "project") {
      return task.projectId === filter.projectId;
    }

    return true;
  });

  return filtered.toSorted((a, b) => b.updatedAt - a.updatedAt);
}

export function groupTasksByPriority(tasks: TaskViewRecord[]): TaskGroups {
  const groups: TaskGroups = { high: [], medium: [], low: [] };
  for (const task of tasks) {
    groups[task.priority].push(task);
  }
  return groups;
}

export function groupTasksByEnergy(tasks: TaskViewRecord[]): EnergyGroups {
  const groups: EnergyGroups = { low: [], medium: [], high: [] };
  for (const task of tasks) {
    groups[task.energy].push(task);
  }
  return groups;
}
