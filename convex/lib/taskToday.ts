export const QUICK_TITLE_MAX = 280;

/** Truncate a quick-add title to the app max, preserving an ellipsis suffix. */
export function truncateQuickTitle(
  title: string,
  max = QUICK_TITLE_MAX,
): string {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Title cannot be empty.");
  }
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 3)}...`;
}

/**
 * Whether a task should appear in a local-day Today list.
 * Uses the same half-open window as `getLocalDayBoundsMs` on the client.
 */
export function isTaskDueInLocalDay(
  dueAt: number | undefined,
  dueFrom: number,
  dueTo: number,
  status: string,
): boolean {
  return (
    dueAt !== undefined &&
    dueAt >= dueFrom &&
    dueAt < dueTo &&
    status !== "cancelled"
  );
}
