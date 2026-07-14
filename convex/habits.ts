import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import {
  buildEnergySuggestion,
  calculateHabitCompletion,
} from "./lib/habit_logic";
import { requireUser } from "./lib/requireUser";

const energyValidator = v.union(v.literal("low"), v.literal("medium"), v.literal("high"));
const cadenceValidator = v.union(v.literal("daily"), v.literal("weekly"));

const habitReturnValidator = v.object({
  _id: v.id("habits"),
  _creationTime: v.number(),
  userId: v.id("users"),
  name: v.string(),
  cadence: cadenceValidator,
  energy: v.optional(energyValidator),
  currentStreak: v.number(),
  longestStreak: v.number(),
  lastCompletedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
  history: v.array(
    v.object({
      _id: v.id("habitCompletions"),
      completedOn: v.string(),
      completedAt: v.number(),
    }),
  ),
  checkedToday: v.boolean(),
});

const completionResultValidator = v.object({
  currentStreak: v.number(),
  longestStreak: v.number(),
  completedOn: v.string(),
  alreadyDone: v.boolean(),
});

const suggestionReturnValidator = v.union(
  v.object({
    _id: v.id("habitSuggestions"),
    _creationTime: v.number(),
    userId: v.id("users"),
    habitId: v.id("habits"),
    title: v.string(),
    reason: v.string(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  }),
  v.null(),
);

async function listCompletions(ctx: QueryCtx | MutationCtx, habitId: Id<"habits">) {
  return await ctx.db
    .query("habitCompletions")
    .withIndex("by_habitId", (q) => q.eq("habitId", habitId))
    .collect();
}

export const list = query({
  args: {
    todayKey: v.optional(v.string()),
  },
  returns: v.array(habitReturnValidator),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const rows = await ctx.db
      .query("habits")
      .withIndex("by_userId_deletedAt", (q) => q.eq("userId", user._id).eq("deletedAt", undefined))
      .collect();
    rows.sort((a, b) => b.updatedAt - a.updatedAt);
    return await Promise.all(
      rows.map(async (habit) => {
        const history = (await listCompletions(ctx, habit._id))
          .filter((completion) => completion.deletedAt === undefined)
          .sort((a, b) => a.completedAt - b.completedAt);
        return {
          ...habit,
          history: history.map((completion) => ({
            _id: completion._id,
            completedOn: completion.completedOn,
            completedAt: completion.completedAt,
          })),
          checkedToday:
            args.todayKey !== undefined &&
            history.some((completion) => completion.completedOn === args.todayKey),
        };
      }),
    );
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    cadence: cadenceValidator,
    energy: v.optional(energyValidator),
  },
  returns: v.id("habits"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const name = args.name.trim();
    if (!name) {
      throw new Error("Habit name cannot be empty.");
    }
    const now = Date.now();
    return await ctx.db.insert("habits", {
      userId: user._id,
      name,
      cadence: args.cadence,
      energy: args.energy ?? "low",
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
    timezoneOffsetMinutes: v.optional(v.number()),
  },
  returns: completionResultValidator,
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== user._id || habit.deletedAt !== undefined) {
      throw new Error("Habit not found");
    }
    const now = Date.now();
    const history = (await listCompletions(ctx, args.habitId))
      .filter((completion) => completion.deletedAt === undefined)
      .sort((a, b) => a.completedAt - b.completedAt);
    const result = calculateHabitCompletion({
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      historyKeys: history.map((completion) => completion.completedOn),
      now,
      timezoneOffsetMinutes: args.timezoneOffsetMinutes,
    });

    if (result.alreadyDone) {
      return {
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
        completedOn: result.completedOn,
        alreadyDone: true,
      };
    }

    await ctx.db.insert("habitCompletions", {
      userId: user._id,
      habitId: args.habitId,
      completedOn: result.completedOn,
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(args.habitId, {
      currentStreak: result.currentStreak,
      longestStreak: result.longestStreak,
      lastCompletedAt: now,
      updatedAt: now,
    });
    return {
      currentStreak: result.currentStreak,
      longestStreak: result.longestStreak,
      completedOn: result.completedOn,
      alreadyDone: false,
    };
  },
});

export const update = mutation({
  args: {
    habitId: v.id("habits"),
    name: v.optional(v.string()),
    cadence: v.optional(cadenceValidator),
    energy: v.optional(energyValidator),
  },
  returns: v.id("habits"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== user._id || habit.deletedAt !== undefined) {
      throw new Error("Habit not found");
    }
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (!name) {
        throw new Error("Habit name cannot be empty.");
      }
      patch.name = name;
    }
    if (args.cadence !== undefined) patch.cadence = args.cadence;
    if (args.energy !== undefined) patch.energy = args.energy;
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
    await ctx.db.patch(args.habitId, { deletedAt: Date.now(), updatedAt: Date.now() });
    return { success: true };
  },
});

export const createEnergySuggestion = mutation({
  args: {},
  returns: suggestionReturnValidator,
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_userId_deletedAt", (q) => q.eq("userId", user._id).eq("deletedAt", undefined))
      .collect();
    const suggestion = buildEnergySuggestion(
      habits.map((habit) => ({
        id: habit._id,
        name: habit.name,
        energy: habit.energy ?? "low",
        currentStreak: habit.currentStreak,
        lastCompletedAt: habit.lastCompletedAt,
      })),
    );
    if (!suggestion) {
      return null;
    }
    const now = Date.now();
    const suggestionId = await ctx.db.insert("habitSuggestions", {
      userId: user._id,
      habitId: suggestion.habitId as Id<"habits">,
      title: suggestion.title,
      reason: suggestion.reason,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(suggestionId);
  },
});

export const setSuggestionStatus = mutation({
  args: {
    suggestionId: v.id("habitSuggestions"),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
  },
  returns: suggestionReturnValidator,
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const suggestion = await ctx.db.get(args.suggestionId);
    if (!suggestion || suggestion.userId !== user._id || suggestion.deletedAt !== undefined) {
      throw new Error("Suggestion not found");
    }
    await ctx.db.patch(args.suggestionId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(args.suggestionId);
  },
});
