export type TaskLike = {
  dueAt?: number;
  status: string;
};

export function filterTasksDueInWindow(
  tasks: TaskLike[],
  startMs: number,
  endMs: number,
  options?: { excludeCancelled?: boolean; excludeDone?: boolean },
): TaskLike[] {
  return tasks.filter((task) => {
    if (task.dueAt === undefined) return false;
    if (task.dueAt < startMs || task.dueAt >= endMs) return false;
    if (options?.excludeCancelled && task.status === "cancelled") return false;
    if (options?.excludeDone && task.status === "done") return false;
    return true;
  });
}

export const QUICK_TITLE_MAX = 280;

export function truncateQuickTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Title cannot be empty.");
  }
  if (trimmed.length > QUICK_TITLE_MAX) {
    return `${trimmed.slice(0, QUICK_TITLE_MAX - 3)}...`;
  }
  return trimmed;
}

export function toggleTaskStatus(status: string): "todo" | "done" {
  return status === "done" ? "todo" : "done";
}
