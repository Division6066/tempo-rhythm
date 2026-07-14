import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { applyHabitCompletion, getUtcDayKey } from "./lib/habit_streak";
import { requireUser } from "./lib/requireUser";

const cadenceValidator = v.union(v.literal("daily"), v.literal("weekly"));
const habitResultValidator = v.object({
  _id: v.id("habits"),
  _creationTime: v.number(),
  userId: v.id("users"),
  name: v.string(),
  cadence: cadenceValidator,
  currentStreak: v.number(),
  longestStreak: v.number(),
  lastCompletedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
  completedToday: v.boolean(),
});

export const list = query({
  args: {
    dayKey: v.optional(v.string()),
  },
  returns: v.array(habitResultValidator),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const rows = await ctx.db
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const activeRows = rows.filter((row) => row.deletedAt === undefined);
    const completedHabitIds = new Set<string>();
    if (args.dayKey !== undefined) {
      const completions = await ctx.db
        .query("habitCompletions")
        .withIndex("by_userId_dayKey", (q) => q.eq("userId", user._id).eq("dayKey", args.dayKey))
        .collect();
      for (const completion of completions) {
        if (completion.deletedAt === undefined) {
          completedHabitIds.add(completion.habitId);
        }
      }
    }
    activeRows.sort((a, b) => b.updatedAt - a.updatedAt);
    return activeRows.map((habit) => ({
      ...habit,
      completedToday: completedHabitIds.has(habit._id),
    }));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    cadence: cadenceValidator,
  },
  returns: v.id("habits"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    return await ctx.db.insert("habits", {
      userId: user._id,
      name: args.name.trim(),
      cadence: args.cadence,
      currentStreak: 0,
      longestStreak: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const completeToday = mutation({
  args: {
    habitId: v.id("habits"),
    dayKey: v.optional(v.string()),
  },
  returns: v.object({
    currentStreak: v.number(),
    longestStreak: v.number(),
    alreadyDone: v.boolean(),
    dayKey: v.string(),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== user._id || habit.deletedAt !== undefined) {
      throw new Error("Habit not found");
    }
    const now = Date.now();
    const dayKey = args.dayKey ?? getUtcDayKey(now);
    const existingCompletion = await ctx.db
      .query("habitCompletions")
      .withIndex("by_habitId_dayKey", (q) => q.eq("habitId", args.habitId).eq("dayKey", dayKey))
      .first();
    const completions = await ctx.db
      .query("habitCompletions")
      .withIndex("by_habitId", (q) => q.eq("habitId", args.habitId))
      .collect();
    const activeDayKeys = completions
      .filter((completion) => completion.deletedAt === undefined)
      .map((completion) => completion.dayKey);
    const summary = applyHabitCompletion(activeDayKeys, dayKey);

    if (!existingCompletion || existingCompletion.deletedAt !== undefined) {
      await ctx.db.insert("habitCompletions", {
        userId: user._id,
        habitId: args.habitId,
        dayKey,
        completedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.patch(args.habitId, {
      currentStreak: summary.currentStreak,
      longestStreak: summary.longestStreak,
      lastCompletedAt: now,
      updatedAt: now,
    });
    return {
      currentStreak: summary.currentStreak,
      longestStreak: summary.longestStreak,
      alreadyDone: summary.alreadyDone,
      dayKey,
    };
  },
});

export const update = mutation({
  args: {
    habitId: v.id("habits"),
    name: v.optional(v.string()),
    cadence: v.optional(cadenceValidator),
  },
  returns: v.id("habits"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== user._id || habit.deletedAt !== undefined) {
      throw new Error("Habit not found");
    }
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = args.name.trim();
    if (args.cadence !== undefined) patch.cadence = args.cadence;
    await ctx.db.patch(args.habitId, patch as typeof habit);
    return args.habitId;
  },
});

export const remove = mutation({
  args: { habitId: v.id("habits") },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== user._id || habit.deletedAt !== undefined) {
      throw new Error("Habit not found");
    }
    await ctx.db.patch(args.habitId, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});
