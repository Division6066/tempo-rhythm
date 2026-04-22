/** Start/end of the local calendar day as Unix ms; `endMs` is exclusive. */
export function getLocalDayBoundsMs(
  date: Date = new Date(),
): { startMs: number; endMs: number } {
  const startMs = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();

  return {
    startMs,
    endMs: startMs + 24 * 60 * 60 * 1000,
  };
}
