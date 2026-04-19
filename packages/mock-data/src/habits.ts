import { MOCK_REFERENCE_MS } from "./constants";
import type { MockHabit } from "./types";

const dayMs = 86400000;

function last7DaysCompletions(streakDays: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < streakDays && i < 7; i += 1) {
    out.push(MOCK_REFERENCE_MS - i * dayMs);
  }
  return out;
}

/** Library · Habits — screens-2.jsx */
export const mockHabits: MockHabit[] = [
  {
    id: "habit-morning-pages",
    name: "Morning pages",
    cadence: "daily",
    streak: 5,
    longestStreak: 31,
    completionRatio: 1,
    recentCompletions: last7DaysCompletions(5),
    color: "moss",
  },
  {
    id: "habit-walk",
    name: "10-minute walk",
    cadence: "daily",
    streak: 3,
    longestStreak: 18,
    completionRatio: 0.5,
    recentCompletions: last7DaysCompletions(3),
    color: "amber",
  },
  {
    id: "habit-shutdown",
    name: "Shutdown sequence",
    cadence: "weekdays",
    streak: 0,
    longestStreak: 14,
    completionRatio: 0,
    recentCompletions: [],
    color: "slate",
  },
  {
    id: "habit-read",
    name: "Read one chapter",
    cadence: "daily",
    streak: 12,
    longestStreak: 24,
    completionRatio: 1,
    recentCompletions: last7DaysCompletions(7),
    color: "moss",
  },
  {
    id: "habit-screens",
    name: "No screens after 10pm",
    cadence: "daily",
    streak: 2,
    longestStreak: 9,
    completionRatio: 0,
    recentCompletions: last7DaysCompletions(2),
    color: "brick",
  },
];

/** Deterministic 14-cell heatmap (replaces Math.random in design export). */
export const mockHabitHeatmap14: boolean[] = [
  true,
  true,
  false,
  true,
  true,
  false,
  true,
  true,
  true,
  false,
  false,
  true,
  true,
  false,
];

/** Deterministic 42-cell grid for habit detail — screens-2.jsx */
export const mockHabitDetailGrid42: boolean[] = Array.from({ length: 42 }, (_, i) => {
  const row = Math.floor(i / 7);
  const col = i % 7;
  return (row + col) % 3 !== 0;
});
