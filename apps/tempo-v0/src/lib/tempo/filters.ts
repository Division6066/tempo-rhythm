/** Port of convex/lib/task_filters.ts */

export type TaskDueRow = {
  dueAt?: number;
  status: string;
};

export function filterTasksDueInRange<T extends TaskDueRow>(
  tasks: T[],
  startMs: number,
  endMs: number,
  options?: { excludeCancelled?: boolean },
): T[] {
  const excludeCancelled = options?.excludeCancelled ?? true;
  return tasks.filter((task) => {
    if (task.dueAt === undefined) return false;
    if (task.dueAt < startMs || task.dueAt >= endMs) return false;
    if (excludeCancelled && task.status === "cancelled") return false;
    return true;
  });
}

export function isOpenTask(status: string): boolean {
  return status === "todo" || status === "in_progress";
}

/** ADHD-critical: never dump the full overdue wall. */
export const OVERDUE_SURFACE_CAP = 2;
