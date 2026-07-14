import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, type MutationCtx, query, type QueryCtx } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

type ConvexCtx = QueryCtx | MutationCtx;
type ResolvedRoutineItem =
  | {
      _id: Id<"routineItems">;
      itemType: "habit";
      position: number;
      habit: {
        _id: Id<"habits">;
        name: string;
        cadence: "daily" | "weekly";
        currentStreak: number;
        longestStreak: number;
        lastCompletedAt?: number;
      };
    }
  | {
      _id: Id<"routineItems">;
      itemType: "task";
      position: number;
      task: {
        _id: Id<"tasks">;
        title: string;
        description?: string;
        status: "todo" | "in_progress" | "done" | "cancelled";
        priority: "low" | "medium" | "high";
        dueAt?: number;
      };
    };

const trimmedString = (value: string, label: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} cannot be empty.`);
  }
  return trimmed;
};

const taskStatusValidator = v.union(
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("done"),
  v.literal("cancelled"),
);

const priorityValidator = v.union(v.literal("low"), v.literal("medium"), v.literal("high"));

const routineSummaryValidator = v.object({
  _id: v.id("routines"),
  name: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  habitCount: v.number(),
  taskCount: v.number(),
});

const habitItemValidator = v.object({
  _id: v.id("routineItems"),
  itemType: v.literal("habit"),
  position: v.number(),
  habit: v.object({
    _id: v.id("habits"),
    name: v.string(),
    cadence: v.union(v.literal("daily"), v.literal("weekly")),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastCompletedAt: v.optional(v.number()),
  }),
});

const taskItemValidator = v.object({
  _id: v.id("routineItems"),
  itemType: v.literal("task"),
  position: v.number(),
  task: v.object({
    _id: v.id("tasks"),
    title: v.string(),
    description: v.optional(v.string()),
    status: taskStatusValidator,
    priority: priorityValidator,
    dueAt: v.optional(v.number()),
  }),
});

const routineDetailValidator = v.object({
  _id: v.id("routines"),
  name: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  items: v.array(v.union(habitItemValidator, taskItemValidator)),
});

const completionResultValidator = v.object({
  routineItemId: v.id("routineItems"),
  itemType: v.union(v.literal("habit"), v.literal("task")),
  completed: v.boolean(),
});

async function getOwnedRoutine(
  ctx: ConvexCtx,
  routineId: Id<"routines">,
  userId: Id<"users">,
) {
  const routine = await ctx.db.get(routineId);
  if (!routine || routine.userId !== userId || routine.deletedAt !== undefined) {
    throw new Error("Routine not found");
  }
  return routine;
}

async function completeHabit(ctx: MutationCtx, habit: Doc<"habits">) {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  let current = habit.currentStreak;

  if (habit.lastCompletedAt !== undefined) {
    const daysSince = Math.floor((now - habit.lastCompletedAt) / dayMs);
    if (daysSince === 0) {
      return;
    }
    current = daysSince === 1 ? current + 1 : 1;
  } else {
    current = 1;
  }

  await ctx.db.patch(habit._id, {
    currentStreak: current,
    longestStreak: Math.max(habit.longestStreak, current),
    lastCompletedAt: now,
    updatedAt: now,
  });
}

export const list = query({
  args: {},
  returns: v.array(routineSummaryValidator),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const routines = await ctx.db
      .query("routines")
      .withIndex("by_userId_deletedAt", (q) => q.eq("userId", user._id).eq("deletedAt", undefined))
      .collect();
    const items = await ctx.db
      .query("routineItems")
      .withIndex("by_userId_deletedAt", (q) => q.eq("userId", user._id).eq("deletedAt", undefined))
      .collect();
    const itemCounts = new Map<Id<"routines">, { habitCount: number; taskCount: number }>();

    for (const item of items) {
      const current = itemCounts.get(item.routineId) ?? { habitCount: 0, taskCount: 0 };
      if (item.itemType === "habit") {
        current.habitCount += 1;
      } else {
        current.taskCount += 1;
      }
      itemCounts.set(item.routineId, current);
    }

    return routines
      .map((routine) => {
        const counts = itemCounts.get(routine._id) ?? { habitCount: 0, taskCount: 0 };
        return {
          _id: routine._id,
          name: routine.name,
          createdAt: routine.createdAt,
          updatedAt: routine.updatedAt,
          habitCount: counts.habitCount,
          taskCount: counts.taskCount,
        };
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getWithItems = query({
  args: { routineId: v.string() },
  returns: v.union(routineDetailValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const routineId = ctx.db.normalizeId("routines", args.routineId);
    if (!routineId) {
      return null;
    }
    const routine = await ctx.db.get(routineId);
    if (!routine || routine.userId !== user._id || routine.deletedAt !== undefined) {
      return null;
    }

    const items = await ctx.db
      .query("routineItems")
      .withIndex("by_routineId_deletedAt", (q) =>
        q.eq("routineId", routine._id).eq("deletedAt", undefined),
      )
      .collect();
    const resolvedItems: ResolvedRoutineItem[] = [];

    for (const item of items.toSorted((a, b) => a.position - b.position)) {
      if (item.itemType === "habit" && item.habitId) {
        const habit = await ctx.db.get(item.habitId);
        if (habit && habit.userId === user._id && habit.deletedAt === undefined) {
          resolvedItems.push({
            _id: item._id,
            itemType: "habit" as const,
            position: item.position,
            habit: {
              _id: habit._id,
              name: habit.name,
              cadence: habit.cadence,
              currentStreak: habit.currentStreak,
              longestStreak: habit.longestStreak,
              lastCompletedAt: habit.lastCompletedAt,
            },
          });
        }
      }

      if (item.itemType === "task" && item.taskId) {
        const task = await ctx.db.get(item.taskId);
        if (task && task.userId === user._id && task.deletedAt === undefined) {
          resolvedItems.push({
            _id: item._id,
            itemType: "task" as const,
            position: item.position,
            task: {
              _id: task._id,
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              dueAt: task.dueAt,
            },
          });
        }
      }
    }

    return {
      _id: routine._id,
      name: routine.name,
      createdAt: routine.createdAt,
      updatedAt: routine.updatedAt,
      items: resolvedItems,
    };
  },
});

export const createWithItems = mutation({
  args: {
    name: v.string(),
    habitName: v.string(),
    taskTitle: v.string(),
  },
  returns: v.id("routines"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    const routineId = await ctx.db.insert("routines", {
      userId: user._id,
      name: trimmedString(args.name, "Routine name"),
      createdAt: now,
      updatedAt: now,
    });
    const habitId = await ctx.db.insert("habits", {
      userId: user._id,
      name: trimmedString(args.habitName, "Habit name"),
      cadence: "daily",
      currentStreak: 0,
      longestStreak: 0,
      createdAt: now,
      updatedAt: now,
    });
    const taskId = await ctx.db.insert("tasks", {
      userId: user._id,
      title: trimmedString(args.taskTitle, "Task title"),
      status: "todo",
      priority: "medium",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("routineItems", {
      userId: user._id,
      routineId,
      itemType: "habit",
      habitId,
      position: 0,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("routineItems", {
      userId: user._id,
      routineId,
      itemType: "task",
      taskId,
      position: 1,
      createdAt: now,
      updatedAt: now,
    });

    return routineId;
  },
});

export const completeItem = mutation({
  args: { routineItemId: v.id("routineItems") },
  returns: completionResultValidator,
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const item = await ctx.db.get(args.routineItemId);
    if (!item || item.userId !== user._id || item.deletedAt !== undefined) {
      throw new Error("Routine item not found");
    }
    await getOwnedRoutine(ctx, item.routineId, user._id);

    if (item.itemType === "habit") {
      if (!item.habitId) {
        throw new Error("Routine habit not found");
      }
      const habit = await ctx.db.get(item.habitId);
      if (!habit || habit.userId !== user._id || habit.deletedAt !== undefined) {
        throw new Error("Habit not found");
      }
      await completeHabit(ctx, habit);
    } else {
      if (!item.taskId) {
        throw new Error("Routine task not found");
      }
      const task = await ctx.db.get(item.taskId);
      if (!task || task.userId !== user._id || task.deletedAt !== undefined) {
        throw new Error("Task not found");
      }
      await ctx.db.patch(task._id, { status: "done", updatedAt: Date.now() });
    }

    await ctx.db.patch(item._id, { updatedAt: Date.now() });
    return { routineItemId: item._id, itemType: item.itemType, completed: true };
  },
});
