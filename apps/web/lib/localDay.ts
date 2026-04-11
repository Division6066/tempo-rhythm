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

export function endOfLocalWeekMondayMs(d = new Date()): number {
  return startOfLocalWeekMondayMs(d) + 7 * 24 * 60 * 60 * 1000;
}
