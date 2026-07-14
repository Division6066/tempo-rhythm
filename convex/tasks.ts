import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";
import { fetchCurrentUser } from "./users";

const taskStatusValidator = v.union(
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("done"),
  v.literal("cancelled"),
);

const taskPriorityValidator = v.union(v.literal("low"), v.literal("medium"), v.literal("high"));
const taskEnergyValidator = v.union(v.literal("low"), v.literal("medium"), v.literal("high"));

const taskReturnValidator = v.object({
  _id: v.id("tasks"),
  _creationTime: v.number(),
  userId: v.id("users"),
  title: v.string(),
  description: v.optional(v.string()),
  status: taskStatusValidator,
  priority: taskPriorityValidator,
  energy: v.optional(taskEnergyValidator),
  projectId: v.optional(v.string()),
  projectName: v.optional(v.string()),
  dueAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

export const list = query({
  args: {
    status: v.optional(
      taskStatusValidator,
    ),
    search: v.optional(v.string()),
    /** When both set, only tasks with `dueAt` in [dueFrom, dueTo) (e.g. client “today” window). */
    dueFrom: v.optional(v.number()),
    dueTo: v.optional(v.number()),
    projectId: v.optional(v.string()),
    priority: v.optional(taskPriorityValidator),
    energy: v.optional(taskEnergyValidator),
  },
  returns: v.array(taskReturnValidator),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    let rows = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    rows = rows.filter((t) => t.deletedAt === undefined);

    if (args.status) {
      rows = rows.filter((t) => t.status === args.status);
    }
    if (args.projectId?.trim()) {
      rows = rows.filter((t) => t.projectId === args.projectId?.trim());
    }
    if (args.priority) {
      rows = rows.filter((t) => t.priority === args.priority);
    }
    if (args.energy) {
      rows = rows.filter((t) => (t.energy ?? "medium") === args.energy);
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

/** Tasks due on a given calendar day (local interpretation: day boundaries passed as ms). */
export const listDueInRange = query({
  args: {
    startMs: v.number(),
    endMs: v.number(),
  },
  returns: v.array(taskReturnValidator),
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
        t.deletedAt === undefined &&
        t.status !== "cancelled",
    );
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(
      taskStatusValidator,
    ),
    priority: v.optional(taskPriorityValidator),
    energy: v.optional(taskEnergyValidator),
    projectId: v.optional(v.string()),
    projectName: v.optional(v.string()),
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
      energy: args.energy ?? "medium",
      projectId: args.projectId?.trim(),
      projectName: args.projectName?.trim(),
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
      taskStatusValidator,
    ),
    priority: v.optional(taskPriorityValidator),
    energy: v.optional(taskEnergyValidator),
    projectId: v.optional(v.union(v.string(), v.null())),
    projectName: v.optional(v.union(v.string(), v.null())),
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
    if (args.energy !== undefined) patch.energy = args.energy;
    if (args.projectId !== undefined) {
      patch.projectId = args.projectId === null ? undefined : args.projectId.trim();
    }
    if (args.projectName !== undefined) {
      patch.projectName = args.projectName === null ? undefined : args.projectName.trim();
    }
    if (args.dueAt !== undefined) {
      patch.dueAt = args.dueAt === null ? undefined : args.dueAt;
    }
    await ctx.db.patch(args.taskId, patch as typeof task);
    return args.taskId;
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

const QUICK_TITLE_MAX = 280;

/** Quick-add a task for today — minimal args, sensible defaults. */
export const createQuick = mutation({
  args: {
    title: v.string(),
    dueAt: v.optional(v.number()),
    projectId: v.optional(v.string()),
    projectName: v.optional(v.string()),
    energy: v.optional(taskEnergyValidator),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const trimmed = args.title.trim();
    if (!trimmed) {
      throw new Error("Title cannot be empty.");
    }
    const title =
      trimmed.length > QUICK_TITLE_MAX ? `${trimmed.slice(0, QUICK_TITLE_MAX - 3)}...` : trimmed;
    const now = Date.now();
    return ctx.db.insert("tasks", {
      userId: user._id,
      title,
      status: "todo",
      priority: "medium",
      energy: args.energy ?? "medium",
      projectId: args.projectId?.trim(),
      projectName: args.projectName?.trim(),
      dueAt: args.dueAt,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Tasks due within a local-day window — used by the Today screen. */
export const listToday = query({
  args: {
    dueFrom: v.number(),
    dueTo: v.number(),
  },
  returns: v.array(taskReturnValidator),
  handler: async (ctx, args) => {
    // Match `users.getProfile` (fetchCurrentUser), not requireUser: avoids throwing when
    // the client auth race briefly has no `email` on the identity, and returns [] if
    // there is no signed-in app user.
    const user = await fetchCurrentUser(ctx);
    if (!user) {
      return [];
    }
    const rows = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    return rows
      .filter(
        (t) =>
          t.dueAt !== undefined &&
          t.dueAt >= args.dueFrom &&
          t.dueAt < args.dueTo &&
          t.deletedAt === undefined &&
          t.status !== "cancelled",
      )
      .sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0));
  },
});

/** Toggle a task between todo and done. */
export const toggleCompletion = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.object({
    taskId: v.id("tasks"),
    status: taskStatusValidator,
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id) {
      throw new Error("Task not found");
    }
    const next: "todo" | "done" = task.status === "done" ? "todo" : "done";
    await ctx.db.patch(args.taskId, { status: next, updatedAt: Date.now() });
    return { taskId: args.taskId, status: next };
  },
});
