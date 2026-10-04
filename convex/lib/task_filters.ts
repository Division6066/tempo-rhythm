export type TaskDueRow = {
  dueAt?: number;
  status: string;
};

/** Half-open due window [startMs, endMs) used by Today and calendar views. */
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
