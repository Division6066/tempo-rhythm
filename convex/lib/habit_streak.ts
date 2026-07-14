const dayKeyPattern = /^\d{4}-\d{2}-\d{2}$/;
const dayMs = 24 * 60 * 60 * 1000;

export type HabitStreakSummary = {
  currentStreak: number;
  longestStreak: number;
  completedDayKeys: string[];
};

function parseDayKey(dayKey: string): number {
  if (!dayKeyPattern.test(dayKey)) {
    throw new Error(`Invalid habit day key: ${dayKey}`);
  }

  const timestamp = Date.parse(`${dayKey}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp)) {
    throw new Error(`Invalid habit day key: ${dayKey}`);
  }

  return timestamp;
}

export function getUtcDayKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function normalizeHabitDayKeys(dayKeys: readonly string[]): string[] {
  const unique = new Set(dayKeys);
  return Array.from(unique).sort((a, b) => parseDayKey(a) - parseDayKey(b));
}

export function calculateHabitStreak(dayKeys: readonly string[]): HabitStreakSummary {
  const completedDayKeys = normalizeHabitDayKeys(dayKeys);
  let longestStreak = 0;
  let runLength = 0;
  let previousTimestamp: number | null = null;

  for (const dayKey of completedDayKeys) {
    const timestamp = parseDayKey(dayKey);
    runLength = previousTimestamp !== null && timestamp - previousTimestamp === dayMs ? runLength + 1 : 1;
    longestStreak = Math.max(longestStreak, runLength);
    previousTimestamp = timestamp;
  }

  return {
    currentStreak: runLength,
    longestStreak,
    completedDayKeys,
  };
}

export function applyHabitCompletion(dayKeys: readonly string[], dayKey: string) {
  const before = new Set(dayKeys);
  const completedDayKeys = normalizeHabitDayKeys([...before, dayKey]);
  const summary = calculateHabitStreak(completedDayKeys);

  return {
    ...summary,
    alreadyDone: before.has(dayKey),
  };
}
