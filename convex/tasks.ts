import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
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

const checklistItemValidator = v.object({
  id: v.string(),
  text: v.string(),
  completed: v.boolean(),
});

const recurrenceValidator = v.object({
  frequency: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
  interval: v.number(),
  nextDueAt: v.number(),
});

const taskReturnValidator = v.object({
  _id: v.id("tasks"),
  _creationTime: v.number(),
  userId: v.id("users"),
  title: v.string(),
  description: v.optional(v.string()),
  status: taskStatusValidator,
  priority: taskPriorityValidator,
  energyLevel: v.optional(taskEnergyValidator),
  projectKey: v.optional(v.string()),
  checklist: v.optional(v.array(checklistItemValidator)),
  recurrence: v.optional(recurrenceValidator),
  dueAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

function normalizeProjectKey(value: string | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized ? normalized : undefined;
}

function normalizeChecklist(items: Doc<"tasks">["checklist"]): Doc<"tasks">["checklist"] {
  const cleaned =
    items
      ?.map((item) => ({
        id: item.id.trim(),
        text: item.text.trim(),
        completed: item.completed,
      }))
      .filter((item) => item.id && item.text) ?? [];

  return cleaned.length > 0 ? cleaned : undefined;
}

function normalizeRecurrence(recurrence: Doc<"tasks">["recurrence"]): Doc<"tasks">["recurrence"] {
  if (!recurrence) {
    return undefined;
  }

  return {
    frequency: recurrence.frequency,
    interval: Math.max(1, Math.floor(recurrence.interval)),
    nextDueAt: recurrence.nextDueAt,
  };
}

function getNextOccurrenceMs(fromMs: number, recurrence: Pick<NonNullable<Doc<"tasks">["recurrence"]>, "frequency" | "interval">): number {
  const interval = Math.max(1, Math.floor(recurrence.interval));
  const next = new Date(fromMs);

  if (recurrence.frequency === "daily") {
    next.setDate(next.getDate() + interval);
  } else if (recurrence.frequency === "weekly") {
    next.setDate(next.getDate() + interval * 7);
  } else {
    next.setMonth(next.getMonth() + interval);
  }

  return next.getTime();
}

export const list = query({
  args: {
    status: v.optional(taskStatusValidator),
    search: v.optional(v.string()),
    projectKey: v.optional(v.string()),
    /** When both set, only tasks with `dueAt` in [dueFrom, dueTo) (e.g. client “today” window). */
    dueFrom: v.optional(v.number()),
    dueTo: v.optional(v.number()),
  },
  returns: v.array(taskReturnValidator),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    let rows = await ctx.db
      .query("tasks")
      .withIndex("by_userId_deletedAt", (q) => q.eq("userId", user._id).eq("deletedAt", undefined))
      .collect();

    if (args.status) {
      rows = rows.filter((t) => t.status === args.status);
    }
    if (args.projectKey?.trim()) {
      const projectKey = normalizeProjectKey(args.projectKey);
      rows = rows.filter((t) => normalizeProjectKey(t.projectKey) === projectKey);
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
      .withIndex("by_userId_deletedAt", (q) => q.eq("userId", user._id).eq("deletedAt", undefined))
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
    status: v.optional(taskStatusValidator),
    priority: v.optional(taskPriorityValidator),
    energyLevel: v.optional(taskEnergyValidator),
    projectKey: v.optional(v.string()),
    checklist: v.optional(v.array(checklistItemValidator)),
    recurrence: v.optional(recurrenceValidator),
    dueAt: v.optional(v.number()),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const title = args.title.trim();
    if (!title) {
      throw new Error("Title cannot be empty.");
    }
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      userId: user._id,
      title,
      description: args.description?.trim(),
      status: args.status ?? "todo",
      priority: args.priority ?? "medium",
      energyLevel: args.energyLevel,
      projectKey: normalizeProjectKey(args.projectKey),
      checklist: normalizeChecklist(args.checklist),
      recurrence: normalizeRecurrence(args.recurrence),
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
    status: v.optional(taskStatusValidator),
    priority: v.optional(taskPriorityValidator),
    energyLevel: v.optional(v.union(taskEnergyValidator, v.null())),
    projectKey: v.optional(v.union(v.string(), v.null())),
    checklist: v.optional(v.union(v.array(checklistItemValidator), v.null())),
    recurrence: v.optional(v.union(recurrenceValidator, v.null())),
    dueAt: v.optional(v.union(v.number(), v.null())),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id || task.deletedAt !== undefined) {
      throw new Error("Task not found");
    }
    const now = Date.now();
    const patch: Partial<Doc<"tasks">> = { updatedAt: now };
    if (args.title !== undefined) patch.title = args.title.trim();
    if (args.description !== undefined) {
      patch.description = args.description === null ? undefined : args.description;
    }
    if (args.status !== undefined) patch.status = args.status;
    if (args.priority !== undefined) patch.priority = args.priority;
    if (args.energyLevel !== undefined) {
      patch.energyLevel = args.energyLevel === null ? undefined : args.energyLevel;
    }
    if (args.projectKey !== undefined) {
      patch.projectKey = args.projectKey === null ? undefined : normalizeProjectKey(args.projectKey);
    }
    if (args.checklist !== undefined) {
      patch.checklist = args.checklist === null ? undefined : normalizeChecklist(args.checklist);
    }
    if (args.recurrence !== undefined) {
      patch.recurrence = args.recurrence === null ? undefined : normalizeRecurrence(args.recurrence);
    }
    if (args.dueAt !== undefined) {
      patch.dueAt = args.dueAt === null ? undefined : args.dueAt;
    }
    await ctx.db.patch(args.taskId, patch);
    return args.taskId;
  },
});

export const remove = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id || task.deletedAt !== undefined) {
      throw new Error("Task not found");
    }
    await ctx.db.patch(args.taskId, { deletedAt: Date.now(), updatedAt: Date.now() });
    return { success: true };
  },
});

const QUICK_TITLE_MAX = 280;

/** Quick-add a task for today — minimal args, sensible defaults. */
export const createQuick = mutation({
  args: {
    title: v.string(),
    dueAt: v.optional(v.number()),
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
    return await ctx.db.insert("tasks", {
      userId: user._id,
      title,
      status: "todo",
      priority: "medium",
      energyLevel: "medium",
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
      .withIndex("by_userId_deletedAt", (q) => q.eq("userId", user._id).eq("deletedAt", undefined))
      .collect();
    return rows
      .filter(
        (t) =>
          t.dueAt !== undefined &&
          t.dueAt >= args.dueFrom &&
          t.dueAt < args.dueTo &&
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
    if (!task || task.userId !== user._id || task.deletedAt !== undefined) {
      throw new Error("Task not found");
    }
    const next: Doc<"tasks">["status"] = task.status === "done" ? "todo" : "done";
    await ctx.db.patch(args.taskId, { status: next, updatedAt: Date.now() });
    return { taskId: args.taskId, status: next };
  },
});

export const updateChecklistItem = mutation({
  args: {
    taskId: v.id("tasks"),
    itemId: v.string(),
    completed: v.boolean(),
  },
  returns: v.object({
    taskId: v.id("tasks"),
    completed: v.number(),
    total: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id || task.deletedAt !== undefined) {
      throw new Error("Task not found");
    }

    const checklist = task.checklist ?? [];
    const nextChecklist = checklist.map((item) =>
      item.id === args.itemId ? { ...item, completed: args.completed } : item,
    );

    if (!nextChecklist.some((item) => item.id === args.itemId)) {
      throw new Error("Checklist item not found");
    }

    await ctx.db.patch(args.taskId, { checklist: nextChecklist, updatedAt: Date.now() });
    return {
      taskId: args.taskId,
      completed: nextChecklist.filter((item) => item.completed).length,
      total: nextChecklist.length,
    };
  },
});

export const createNextOccurrence = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id || task.deletedAt !== undefined) {
      throw new Error("Task not found");
    }

    if (!task.recurrence) {
      throw new Error("Task is not recurring");
    }

    const now = Date.now();
    const nextDueAt = task.recurrence.nextDueAt;
    const nextRecurrence = {
      ...task.recurrence,
      nextDueAt: getNextOccurrenceMs(nextDueAt, task.recurrence),
    };

    return await ctx.db.insert("tasks", {
      userId: user._id,
      title: task.title,
      description: task.description,
      status: "todo",
      priority: task.priority,
      energyLevel: task.energyLevel,
      projectKey: task.projectKey,
      checklist: task.checklist?.map((item) => ({ ...item, completed: false })),
      recurrence: nextRecurrence,
      dueAt: nextDueAt,
      createdAt: now,
      updatedAt: now,
    });
  },
});
