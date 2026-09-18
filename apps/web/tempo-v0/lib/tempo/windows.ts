const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfLocalDay(ms: number = Date.now()): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function endOfLocalDay(ms: number = Date.now()): number {
  return startOfLocalDay(ms) + DAY_MS;
}

export function startOfLocalWeek(ms: number = Date.now()): number {
  const start = new Date(startOfLocalDay(ms));
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);
  return start.getTime();
}

export function isoDay(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDayHeading(ms: number = Date.now()): { weekday: string; rest: string } {
  const d = new Date(ms);
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "long" }),
    rest: d.toLocaleDateString(undefined, { month: "long", day: "numeric" }),
  };
}

export function formatShortDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function daysOverdue(dueAt: number, now: number = Date.now()): number {
  const dueDay = startOfLocalDay(dueAt);
  const today = startOfLocalDay(now);
  return Math.max(0, Math.round((today - dueDay) / DAY_MS));
}

export { DAY_MS };
