import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { createRoutineItemDrafts } from "./lib/habit_logic";
import { requireUser } from "./lib/requireUser";

const routineItemInputValidator = v.union(
  v.object({
    type: v.literal("habit"),
    habitId: v.id("habits"),
  }),
  v.object({
    type: v.literal("task"),
    taskId: v.id("tasks"),
  }),
);

const routineReturnValidator = v.object({
  _id: v.id("routines"),
  _creationTime: v.number(),
  userId: v.id("users"),
  name: v.string(),
  description: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
  items: v.array(
    v.object({
      _id: v.id("routineItems"),
      itemType: v.union(v.literal("habit"), v.literal("task")),
      order: v.number(),
      habit: v.optional(
        v.object({
          _id: v.id("habits"),
          name: v.string(),
          currentStreak: v.number(),
        }),
      ),
      task: v.optional(
        v.object({
          _id: v.id("tasks"),
          title: v.string(),
          status: v.union(
            v.literal("todo"),
            v.literal("in_progress"),
            v.literal("done"),
            v.literal("cancelled"),
          ),
        }),
      ),
    }),
  ),
});

async function loadRoutineItems(ctx: Parameters<typeof requireUser>[0], routineId: string) {
  const normalizedRoutineId = ctx.db.normalizeId("routines", routineId);
  if (!normalizedRoutineId) {
    return [];
  }
  const items = await ctx.db
    .query("routineItems")
    .withIndex("by_routineId_order", (q) => q.eq("routineId", normalizedRoutineId))
    .collect();
  const liveItems = items
    .filter((item) => item.deletedAt === undefined)
    .sort((a, b) => a.order - b.order);

  return await Promise.all(
    liveItems.map(async (item) => {
      const habit = item.habitId ? await ctx.db.get(item.habitId) : undefined;
      const task = item.taskId ? await ctx.db.get(item.taskId) : undefined;
      return {
        _id: item._id,
        itemType: item.itemType,
        order: item.order,
        habit:
          habit && habit.deletedAt === undefined
            ? {
                _id: habit._id,
                name: habit.name,
                currentStreak: habit.currentStreak,
              }
            : undefined,
        task:
          task && task.deletedAt === undefined
            ? {
                _id: task._id,
                title: task.title,
                status: task.status,
              }
            : undefined,
      };
    }),
  );
}

export const list = query({
  args: {},
  returns: v.array(routineReturnValidator),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const routines = await ctx.db
      .query("routines")
      .withIndex("by_userId_deletedAt", (q) => q.eq("userId", user._id).eq("deletedAt", undefined))
      .collect();
    routines.sort((a, b) => b.updatedAt - a.updatedAt);
    return await Promise.all(
      routines.map(async (routine) => ({
        ...routine,
        items: await loadRoutineItems(ctx, routine._id),
      })),
    );
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    items: v.array(routineItemInputValidator),
  },
  returns: v.id("routines"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const name = args.name.trim();
    if (!name) {
      throw new Error("Routine name cannot be empty.");
    }
    const drafts = createRoutineItemDrafts(args.items);
    const now = Date.now();

    for (const draft of drafts) {
      if (draft.itemType === "habit" && draft.habitId) {
        const habitId = ctx.db.normalizeId("habits", draft.habitId);
        const habit = habitId ? await ctx.db.get(habitId) : null;
        if (!habit || habit.userId !== user._id || habit.deletedAt !== undefined) {
          throw new Error("Routine habit not found.");
        }
      }
      if (draft.itemType === "task" && draft.taskId) {
        const taskId = ctx.db.normalizeId("tasks", draft.taskId);
        const task = taskId ? await ctx.db.get(taskId) : null;
        if (!task || task.userId !== user._id || task.deletedAt !== undefined) {
          throw new Error("Routine task not found.");
        }
      }
    }

    const routineId = await ctx.db.insert("routines", {
      userId: user._id,
      name,
      description: args.description?.trim(),
      createdAt: now,
      updatedAt: now,
    });

    for (const draft of drafts) {
      await ctx.db.insert("routineItems", {
        userId: user._id,
        routineId,
        itemType: draft.itemType,
        habitId: draft.habitId ? ctx.db.normalizeId("habits", draft.habitId) ?? undefined : undefined,
        taskId: draft.taskId ? ctx.db.normalizeId("tasks", draft.taskId) ?? undefined : undefined,
        order: draft.order,
        createdAt: now,
        updatedAt: now,
      });
    }

    return routineId;
  },
});
