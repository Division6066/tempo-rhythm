/**
 * Pure aggregation for the Insights screen. The public query lives on
 * `analytics.insightsSummary` so we do not add a new Convex module (generated
 * `api.d.ts` is committed and not regenerated in this cloud environment).
 *
 * Conventions:
 * - "open" task = status todo/in_progress and not soft-deleted.
 * - overdue = open with a dueAt strictly before todayStartMs.
 * - completed this week = done with updatedAt >= weekStartMs.
 * - a task without an energy level counts as "medium" (matches tasks.list).
 */

export type InsightsTaskRow = {
  status: "todo" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high";
  energy?: "low" | "medium" | "high";
  dueAt?: number;
  updatedAt: number;
  deletedAt?: number;
};

export type InsightsHabitRow = {
  currentStreak: number;
  longestStreak: number;
  deletedAt?: number;
};

export type InsightsGoalRow = {
  status: "active" | "completed" | "archived";
  progressPercent: number;
  deletedAt?: number;
};

export type InsightsSummary = {
  tasksOpen: number;
  tasksDueToday: number;
  tasksOverdue: number;
  tasksCompletedThisWeek: number;
  openByEnergy: { low: number; medium: number; high: number };
  openByPriority: { low: number; medium: number; high: number };
  habitsTotal: number;
  habitsWithActiveStreak: number;
  bestStreak: number;
  goalsActive: number;
  goalsAverageProgressPercent: number;
};

export function computeInsightsSummary(input: {
  tasks: InsightsTaskRow[];
  habits: InsightsHabitRow[];
  goals: InsightsGoalRow[];
  todayStartMs: number;
  todayEndMs: number;
  weekStartMs: number;
}): InsightsSummary {
  const liveTasks = input.tasks.filter((t) => t.deletedAt === undefined);
  const openTasks = liveTasks.filter((t) => t.status === "todo" || t.status === "in_progress");

  const openByEnergy = { low: 0, medium: 0, high: 0 };
  const openByPriority = { low: 0, medium: 0, high: 0 };
  let tasksDueToday = 0;
  let tasksOverdue = 0;

  for (const task of openTasks) {
    openByEnergy[task.energy ?? "medium"] += 1;
    openByPriority[task.priority] += 1;
    if (task.dueAt !== undefined) {
      if (task.dueAt >= input.todayStartMs && task.dueAt < input.todayEndMs) {
        tasksDueToday += 1;
      } else if (task.dueAt < input.todayStartMs) {
        tasksOverdue += 1;
      }
    }
  }

  const tasksCompletedThisWeek = liveTasks.filter(
    (t) => t.status === "done" && t.updatedAt >= input.weekStartMs,
  ).length;

  const liveHabits = input.habits.filter((h) => h.deletedAt === undefined);
  const habitsWithActiveStreak = liveHabits.filter((h) => h.currentStreak > 0).length;
  let bestStreak = 0;
  for (const habit of liveHabits) {
    if (habit.longestStreak > bestStreak) {
      bestStreak = habit.longestStreak;
    }
  }

  const liveGoals = input.goals.filter((g) => g.deletedAt === undefined);
  const activeGoals = liveGoals.filter((g) => g.status === "active");
  const goalsAverageProgressPercent =
    activeGoals.length === 0
      ? 0
      : Math.round(
          activeGoals.reduce((sum, goal) => sum + goal.progressPercent, 0) / activeGoals.length,
        );

  return {
    tasksOpen: openTasks.length,
    tasksDueToday,
    tasksOverdue,
    tasksCompletedThisWeek,
    openByEnergy,
    openByPriority,
    habitsTotal: liveHabits.length,
    habitsWithActiveStreak,
    bestStreak,
    goalsActive: activeGoals.length,
    goalsAverageProgressPercent,
  };
}
