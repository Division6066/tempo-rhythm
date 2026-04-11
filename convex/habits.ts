import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const rows = await ctx.db
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    rows.sort((a, b) => b.updatedAt - a.updatedAt);
    return rows;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    cadence: v.union(v.literal("daily"), v.literal("weekly")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    return ctx.db.insert("habits", {
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
  args: { habitId: v.id("habits") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== user._id) {
      throw new Error("Habit not found");
    }
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    let current = habit.currentStreak;
    if (habit.lastCompletedAt !== undefined) {
      const daysSince = Math.floor((now - habit.lastCompletedAt) / dayMs);
      if (daysSince === 0) {
        return { currentStreak: habit.currentStreak, alreadyDone: true as const };
      }
      if (daysSince === 1) {
        current += 1;
      } else {
        current = 1;
      }
    } else {
      current = 1;
    }
    const longest = Math.max(habit.longestStreak, current);
    await ctx.db.patch(args.habitId, {
      currentStreak: current,
      longestStreak: longest,
      lastCompletedAt: now,
      updatedAt: now,
    });
    return { currentStreak: current, longestStreak: longest, alreadyDone: false as const };
  },
});

export const update = mutation({
  args: {
    habitId: v.id("habits"),
    name: v.optional(v.string()),
    cadence: v.optional(v.union(v.literal("daily"), v.literal("weekly"))),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== user._id) {
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
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== user._id) {
      throw new Error("Habit not found");
    }
    await ctx.db.delete(args.habitId);
    return { success: true };
  },
});
