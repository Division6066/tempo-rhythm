/**
 * Start/end of the local calendar day as Unix ms; `dueTo` is exclusive.
 * Shape matches `api.tasks.listToday` args (`{ dueFrom, dueTo }`).
 */
export function getLocalDayBoundsMs(d = new Date()): { dueFrom: number; dueTo: number } {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return { dueFrom: start, dueTo: start + 86_400_000 };
}
