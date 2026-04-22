/**
 * Local calendar-day helpers. These respect the user's browser timezone so
 * "today" means the user's local today, not UTC.
 */

/** Start of local calendar day (ms). */
export function startOfLocalDayMs(d = new Date()): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/** End of local calendar day (exclusive, ms). */
export function endOfLocalDayMs(d = new Date()): number {
  return startOfLocalDayMs(d) + 24 * 60 * 60 * 1000;
}

/** Monday 00:00 local time of the week containing `d`. */
export function startOfLocalWeekMondayMs(d = new Date()): number {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/** YYYY-MM-DD string for the given local date (default: now). */
export function getLocalDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Human-friendly heading for a date — e.g. "Wednesday, April 22". */
export function formatLongDate(d = new Date()): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
