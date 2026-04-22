import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

const taskStatusValidator = v.union(
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("done"),
  v.literal("cancelled"),
);

const taskPriorityValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
);

const taskDocValidator = v.object({
  _id: v.id("tasks"),
  _creationTime: v.number(),
  userId: v.id("users"),
  title: v.string(),
  description: v.optional(v.string()),
  status: taskStatusValidator,
  priority: taskPriorityValidator,
  dueAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

const priorityRank: Record<"high" | "medium" | "low", number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function sortTodayTasks<
  T extends {
    status: "todo" | "in_progress" | "done" | "cancelled";
    priority: "low" | "medium" | "high";
    dueAt?: number;
    updatedAt: number;
    createdAt: number;
  },
>(a: T, b: T) {
  const aDone = a.status === "done" ? 1 : 0;
  const bDone = b.status === "done" ? 1 : 0;
  if (aDone !== bDone) {
    return aDone - bDone;
  }

  const priorityDiff = priorityRank[a.priority] - priorityRank[b.priority];
  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  const dueDiff = (a.dueAt ?? Number.MAX_SAFE_INTEGER) - (b.dueAt ?? Number.MAX_SAFE_INTEGER);
  if (dueDiff !== 0) {
    return dueDiff;
  }

  return b.updatedAt - a.updatedAt || b.createdAt - a.createdAt;
}

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("done"),
        v.literal("cancelled"),
      ),
    ),
    search: v.optional(v.string()),
    /** When both set, only tasks with `dueAt` in [dueFrom, dueTo) (e.g. client “today” window). */
    dueFrom: v.optional(v.number()),
    dueTo: v.optional(v.number()),
  },
  returns: v.array(taskDocValidator),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    let rows = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    if (args.status) {
      rows = rows.filter((t) => t.status === args.status);
    }
    if (args.search?.trim()) {
      const q = args.search.trim().toLowerCase();
      rows = rows.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description?.toLowerCase().includes(q) ?? false),
      );
    }
    if (args.dueFrom !== undefined && args.dueTo !== undefined) {
      rows = rows.filter(
        (t) =>
          t.dueAt !== undefined &&
          t.dueAt >= args.dueFrom! &&
          t.dueAt < args.dueTo!,
      );
    }
    rows.sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt));
    return rows;
  },
});

export const listToday = query({
  args: {
    startMs: v.number(),
    endMs: v.number(),
  },
  returns: v.array(taskDocValidator),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const rows = await ctx.db
      .query("tasks")
      .withIndex("by_userId_dueAt", (q) =>
        q.eq("userId", user._id).gte("dueAt", args.startMs).lt("dueAt", args.endMs),
      )
      .collect();

    const visibleRows = rows.filter(
      (task) => task.deletedAt === undefined && task.status !== "cancelled",
    );
    visibleRows.sort(sortTodayTasks);
    return visibleRows;
  },
});

/** Tasks due on a given calendar day (local interpretation: day boundaries passed as ms). */
export const listDueInRange = query({
  args: {
    startMs: v.number(),
    endMs: v.number(),
  },
  returns: v.array(taskDocValidator),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const rows = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    return rows.filter(
      (t) =>
        t.dueAt !== undefined &&
        t.dueAt >= args.startMs &&
        t.dueAt < args.endMs &&
        t.status !== "cancelled",
    );
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("done"),
        v.literal("cancelled"),
      ),
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    ),
    dueAt: v.optional(v.number()),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    return ctx.db.insert("tasks", {
      userId: user._id,
      title: args.title.trim(),
      description: args.description?.trim(),
      status: args.status ?? "todo",
      priority: args.priority ?? "medium",
      dueAt: args.dueAt,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createQuick = mutation({
  args: {
    title: v.string(),
    dueAt: v.number(),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const title = args.title.trim();
    if (title.length === 0) {
      throw new Error("Task title is required");
    }
    if (title.length > 200) {
      throw new Error("Task title is too long");
    }

    const now = Date.now();
    return ctx.db.insert("tasks", {
      userId: user._id,
      title,
      status: "todo",
      priority: "medium",
      dueAt: args.dueAt,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    status: v.optional(
      v.union(
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("done"),
        v.literal("cancelled"),
      ),
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    ),
    dueAt: v.optional(v.union(v.number(), v.null())),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id) {
      throw new Error("Task not found");
    }
    const now = Date.now();
    const patch: Record<string, unknown> = { updatedAt: now };
    if (args.title !== undefined) patch.title = args.title.trim();
    if (args.description !== undefined) {
      patch.description = args.description === null ? undefined : args.description;
    }
    if (args.status !== undefined) patch.status = args.status;
    if (args.priority !== undefined) patch.priority = args.priority;
    if (args.dueAt !== undefined) {
      patch.dueAt = args.dueAt === null ? undefined : args.dueAt;
    }
    await ctx.db.patch(args.taskId, patch as typeof task);
    return args.taskId;
  },
});

export const toggleCompletion = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  returns: v.object({
    taskId: v.id("tasks"),
    status: taskStatusValidator,
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id || task.deletedAt !== undefined) {
      throw new Error("Task not found");
    }

    const nextStatus: "todo" | "done" = task.status === "done" ? "todo" : "done";
    await ctx.db.patch(args.taskId, {
      status: nextStatus,
      updatedAt: Date.now(),
    });

    return { taskId: args.taskId, status: nextStatus };
  },
});

export const remove = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id) {
      throw new Error("Task not found");
    }
    await ctx.db.delete(args.taskId);
    return { success: true };
  },
});
