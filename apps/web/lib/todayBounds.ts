/** Start/end of the local calendar day as Unix ms; `endMs` is exclusive. */
export function getLocalDayBoundsMs(d = new Date()): { startMs: number; endMs: number } {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const end = start + 24 * 60 * 60 * 1000;
  return { startMs: start, endMs: end };
}
