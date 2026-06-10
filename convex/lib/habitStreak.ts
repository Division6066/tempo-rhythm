const DAY_MS = 24 * 60 * 60 * 1000;

export type HabitStreakResult = {
  currentStreak: number;
  alreadyDone: boolean;
};

/**
 * Pure streak math for `habits.completeToday`.
 * `now` and `lastCompletedAt` are wall-clock ms (mutation-safe).
 */
export function computeStreakAfterCompletion(
  lastCompletedAt: number | undefined,
  now: number,
  currentStreak: number,
): HabitStreakResult {
  if (lastCompletedAt === undefined) {
    return { currentStreak: 1, alreadyDone: false };
  }

  const daysSince = Math.floor((now - lastCompletedAt) / DAY_MS);
  if (daysSince === 0) {
    return { currentStreak, alreadyDone: true };
  }
  if (daysSince === 1) {
    return { currentStreak: currentStreak + 1, alreadyDone: false };
  }
  return { currentStreak: 1, alreadyDone: false };
}
