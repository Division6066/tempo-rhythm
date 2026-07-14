export type HabitCompletionInput = {
  currentStreak: number;
  longestStreak: number;
  historyKeys: string[];
  now: number;
  timezoneOffsetMinutes?: number;
};

export type HabitCompletionResult = {
  alreadyDone: boolean;
  currentStreak: number;
  longestStreak: number;
  completedOn: string;
  historyKeys: string[];
};

export type RoutineItemInput = {
  type: "habit" | "task";
  habitId?: string;
  taskId?: string;
};

export type RoutineItemDraft = {
  itemType: "habit" | "task";
  habitId?: string;
  taskId?: string;
  order: number;
};

export type HabitSuggestionCandidate = {
  id: string;
  name: string;
  energy: "low" | "medium" | "high";
  currentStreak: number;
  lastCompletedAt?: number;
};

export type EnergySuggestion = {
  habitId: string;
  title: string;
  reason: string;
};

export function getLocalDateKey(timestampMs: number, timezoneOffsetMinutes = 0): string {
  return new Date(timestampMs + timezoneOffsetMinutes * 60 * 1000).toISOString().slice(0, 10);
}

function dayNumber(dateKey: string): number {
  const parsed = Date.parse(`${dateKey}T00:00:00.000Z`);
  if (Number.isNaN(parsed)) {
    throw new Error("Invalid habit history date.");
  }
  return Math.floor(parsed / 86_400_000);
}

export function calculateHabitCompletion(input: HabitCompletionInput): HabitCompletionResult {
  const completedOn = getLocalDateKey(input.now, input.timezoneOffsetMinutes);
  const historyKeys = Array.from(new Set(input.historyKeys)).sort();

  if (historyKeys.includes(completedOn)) {
    return {
      alreadyDone: true,
      currentStreak: input.currentStreak,
      longestStreak: input.longestStreak,
      completedOn,
      historyKeys,
    };
  }

  const previousKey = historyKeys.at(-1);
  const nextStreak =
    previousKey && dayNumber(completedOn) - dayNumber(previousKey) === 1
      ? input.currentStreak + 1
      : 1;
  const nextHistoryKeys = [...historyKeys, completedOn];

  return {
    alreadyDone: false,
    currentStreak: nextStreak,
    longestStreak: Math.max(input.longestStreak, nextStreak),
    completedOn,
    historyKeys: nextHistoryKeys,
  };
}

export function createRoutineItemDrafts(items: RoutineItemInput[]): RoutineItemDraft[] {
  return items.map((item, order) => ({
    itemType: item.type,
    habitId: item.type === "habit" ? requireReference(item.habitId, "habit") : undefined,
    taskId: item.type === "task" ? requireReference(item.taskId, "task") : undefined,
    order,
  }));
}

function requireReference(value: string | undefined, label: "habit" | "task"): string {
  if (!value) {
    throw new Error(`Routine ${label} item needs a ${label} reference.`);
  }
  return value;
}

const energyRank: Record<HabitSuggestionCandidate["energy"], number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export function buildEnergySuggestion(
  candidates: HabitSuggestionCandidate[],
  now = Date.now(),
): EnergySuggestion | null {
  const todayKey = getLocalDateKey(now);
  const candidate = candidates
    .filter((habit) => {
      if (habit.lastCompletedAt === undefined) {
        return true;
      }
      return getLocalDateKey(habit.lastCompletedAt) !== todayKey;
    })
    .toSorted((a, b) => {
      const byEnergy = energyRank[a.energy] - energyRank[b.energy];
      if (byEnergy !== 0) {
        return byEnergy;
      }
      return b.currentStreak - a.currentStreak;
    })[0];

  if (!candidate) {
    return null;
  }
  return {
    habitId: candidate.id,
    title: candidate.name,
    reason: `This looks like a ${candidate.energy}-energy option for today.`,
  };
}
