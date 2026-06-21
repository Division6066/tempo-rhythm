export type TaskDueRow = {
  dueAt?: number;
  status: string;
};

/** Half-open window [dueFrom, dueTo) used by Today and calendar views. */
export function filterTasksDueInHalfOpenRange<T extends TaskDueRow>(
  tasks: T[],
  dueFrom: number,
  dueTo: number,
  options?: { excludeCancelled?: boolean },
): T[] {
  const excludeCancelled = options?.excludeCancelled ?? true;
  return tasks.filter((t) => {
    if (excludeCancelled && t.status === "cancelled") {
      return false;
    }
    return t.dueAt !== undefined && t.dueAt >= dueFrom && t.dueAt < dueTo;
  });
}

export const QUICK_TASK_TITLE_MAX = 280;

/** Trims and truncates quick-add task titles. Exported for unit tests. */
export function truncateQuickTaskTitle(
  title: string,
  max = QUICK_TASK_TITLE_MAX,
): string {
  const trimmed = title.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 3)}...`;
}
