import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

/**
 * Read-only insights for the /insights screen.
 *
 * HARD_RULES §10 / Convex rule `no-date-now-in-queries`: the caller passes the
 * local-day and local-week windows (derived client-side from the user's clock);
 * the query body never touches wall-clock time, so results stay cacheable and
 * reactive.
 *
 * The query returns computed scalars only — never raw table rows — so the
 * `returns` validator cannot drift from `convex/schema.ts` field lists.
 */

/** Guard against absurd client windows (DST-tolerant day, one-week lookback). */
const maxDayWindowMs = 48 * 60 * 60 * 1000;
const maxWeekLookbackMs = 9 * 24 * 60 * 60 * 1000;

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

/**
 * Pure aggregation over already-fetched rows. Exported for unit tests
 * (convex/insights.test.ts) — the query handler is a thin wrapper around this.
 *
 * Conventions:
 * - "open" task = status todo/in_progress and not soft-deleted.
 * - overdue = open with a dueAt strictly before todayStartMs.
 * - completed this week = done with updatedAt >= weekStartMs (updatedAt is set
 *   on every mutation, so it marks the completion moment for done tasks).
 * - a task without an energy level counts as "medium" (matches tasks.list).
 */
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

export const summary = query({
  args: {
    /** Epoch ms at the start of the user's local "today". */
    todayStartMs: v.number(),
    /** Epoch ms at the end of the user's local "today" (exclusive). */
    todayEndMs: v.number(),
    /** Epoch ms at the start of the user's local week (Monday 00:00). */
    weekStartMs: v.number(),
  },
  returns: v.object({
    tasksOpen: v.number(),
    tasksDueToday: v.number(),
    tasksOverdue: v.number(),
    tasksCompletedThisWeek: v.number(),
    openByEnergy: v.object({ low: v.number(), medium: v.number(), high: v.number() }),
    openByPriority: v.object({ low: v.number(), medium: v.number(), high: v.number() }),
    habitsTotal: v.number(),
    habitsWithActiveStreak: v.number(),
    bestStreak: v.number(),
    goalsActive: v.number(),
    goalsAverageProgressPercent: v.number(),
  }),
  handler: async (ctx, args) => {
    if (args.todayEndMs <= args.todayStartMs) {
      throw new Error("Today window must end after it starts.");
    }
    if (args.todayEndMs - args.todayStartMs > maxDayWindowMs) {
      throw new Error("Today window is too large.");
    }
    if (args.weekStartMs > args.todayStartMs) {
      throw new Error("Week must start on or before today.");
    }
    if (args.todayStartMs - args.weekStartMs > maxWeekLookbackMs) {
      throw new Error("Week window is too large.");
    }

    const user = await requireUser(ctx);

    const [tasks, habits, goals] = await Promise.all([
      ctx.db
        .query("tasks")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("habits")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("goals")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect(),
    ]);

    return computeInsightsSummary({
      tasks,
      habits,
      goals,
      todayStartMs: args.todayStartMs,
      todayEndMs: args.todayEndMs,
      weekStartMs: args.weekStartMs,
    });
  },
});
