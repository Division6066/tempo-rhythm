const DAY_MS = 24 * 60 * 60 * 1000;

/** True when `lastCompletedAt` falls on the same UTC day as `now`. */
export function isHabitCompletedOnUtcDay(
	lastCompletedAt: number | undefined,
	now: number,
): boolean {
	if (lastCompletedAt === undefined) {
		return false;
	}
	return Math.floor((now - lastCompletedAt) / DAY_MS) === 0;
}

export type HabitStreakUpdate =
	| { alreadyDone: true; currentStreak: number }
	| { alreadyDone: false; currentStreak: number; longestStreak: number };

/**
 * Pure streak math for `habits.completeToday`. Exported for unit tests.
 * Uses UTC day boundaries (floor of elapsed ms / DAY_MS).
 */
export function computeHabitStreakUpdate(
	now: number,
	lastCompletedAt: number | undefined,
	currentStreak: number,
	longestStreak: number,
): HabitStreakUpdate {
	let current = currentStreak;
	if (lastCompletedAt !== undefined) {
		const daysSince = Math.floor((now - lastCompletedAt) / DAY_MS);
		if (daysSince === 0) {
			return { currentStreak: currentStreak, alreadyDone: true };
		}
		if (daysSince === 1) {
			current += 1;
		} else {
			current = 1;
		}
	} else {
		current = 1;
	}
	return {
		currentStreak: current,
		longestStreak: Math.max(longestStreak, current),
		alreadyDone: false,
	};
}
