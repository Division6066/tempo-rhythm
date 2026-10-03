/** Half-open local-day window [startMs, endMs) — same as Today filters. */
export function isWithinToday(
  timestamp: number | undefined,
  startMs: number,
  endMs: number,
): boolean {
  return timestamp !== undefined && timestamp >= startMs && timestamp < endMs;
}
