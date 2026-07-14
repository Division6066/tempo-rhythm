import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
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

const recurrenceFrequencyValidator = v.union(
  v.literal("daily"),
  v.literal("weekly"),
  v.literal("monthly"),
);

const recurrenceInputValidator = v.object({
  frequency: recurrenceFrequencyValidator,
  interval: v.optional(v.number()),
  endAt: v.optional(v.number()),
});

type TaskStatus = Doc<"tasks">["status"];
type TaskPriority = Doc<"tasks">["priority"];
type RecurrenceFrequency = "daily" | "weekly" | "monthly";

export type RecurrenceInput = {
  frequency: RecurrenceFrequency;
  interval?: number;
  endAt?: number;
};

type NormalizedRecurrence = {
  frequency: RecurrenceFrequency;
  interval: number;
  endAt?: number;
};

function normalizeRecurrence(input: RecurrenceInput): NormalizedRecurrence {
  const interval = input.interval ?? 1;
  if (!Number.isInteger(interval) || interval < 1) {
    throw new Error("Recurring tasks need an interval of at least 1.");
  }
  return {
    frequency: input.frequency,
    interval,
    endAt: input.endAt,
  };
}

function daysInUtcMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function addMonthsClamped(ms: number, months: number) {
  const date = new Date(ms);
  const targetYear = date.getUTCFullYear();
  const targetMonth = date.getUTCMonth() + months;
  const targetDay = Math.min(
    date.getUTCDate(),
    daysInUtcMonth(targetYear, targetMonth),
  );
  return Date.UTC(
    targetYear,
    targetMonth,
    targetDay,
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  );
}

export function computeNextOccurrenceDueAt(
  dueAt: number,
  recurrence: RecurrenceInput,
) {
  const normalized = normalizeRecurrence(recurrence);
  switch (normalized.frequency) {
    case "daily":
      return dueAt + normalized.interval * 24 * 60 * 60 * 1000;
    case "weekly":
      return dueAt + normalized.interval * 7 * 24 * 60 * 60 * 1000;
    case "monthly":
      return addMonthsClamped(dueAt, normalized.interval);
  }
}

export function planRecurringTaskCreation(dueAt: number, recurrence: RecurrenceInput) {
  const normalized = normalizeRecurrence(recurrence);
  const firstOccurrenceDueAt = computeNextOccurrenceDueAt(dueAt, normalized);
  const nextDueAt = computeNextOccurrenceDueAt(firstOccurrenceDueAt, normalized);
  const shouldCreateFirstOccurrence =
    normalized.endAt === undefined || firstOccurrenceDueAt <= normalized.endAt;
  return {
    recurrence: normalized,
    firstOccurrenceDueAt,
    nextDueAt,
    shouldCreateFirstOccurrence,
  };
}

async function insertTaskOccurrence(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    title: string;
    description?: string;
    priority: TaskPriority;
    dueAt: number;
    parentTaskId: Id<"tasks">;
    recurrenceIndex: number;
    now: number;
  },
) {
  return await ctx.db.insert("tasks", {
    userId: args.userId,
    title: args.title,
    description: args.description,
    status: "todo",
    priority: args.priority,
    dueAt: args.dueAt,
    recurrenceParentId: args.parentTaskId,
    recurrenceIndex: args.recurrenceIndex,
    createdAt: args.now,
    updatedAt: args.now,
  });
}

export const list = query({
  args: {
    status: v.optional(taskStatusValidator),
    search: v.optional(v.string()),
    /** When both set, only tasks with `dueAt` in [dueFrom, dueTo) (e.g. client “today” window). */
    dueFrom: v.optional(v.number()),
    dueTo: v.optional(v.number()),
  },
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

/** Tasks due on a given calendar day (local interpretation: day boundaries passed as ms). */
export const listDueInRange = query({
  args: {
    startMs: v.number(),
    endMs: v.number(),
  },
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
    status: v.optional(taskStatusValidator),
    priority: v.optional(taskPriorityValidator),
    dueAt: v.optional(v.number()),
    recurrence: v.optional(recurrenceInputValidator),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    const title = args.title.trim();
    const description = args.description?.trim();
    const priority = args.priority ?? "medium";
    const recurrence = args.recurrence
      ? normalizeRecurrence(args.recurrence)
      : undefined;

    if (recurrence && args.dueAt === undefined) {
      throw new Error("Recurring tasks need a first due date.");
    }

    const recurrencePlan =
      recurrence && args.dueAt !== undefined
        ? planRecurringTaskCreation(args.dueAt, recurrence)
        : undefined;

    const taskId = await ctx.db.insert("tasks", {
      userId: user._id,
      title,
      description,
      status: args.status ?? "todo",
      priority,
      dueAt: args.dueAt,
      recurrence:
        recurrencePlan && args.dueAt !== undefined
          ? {
              frequency: recurrencePlan.recurrence.frequency,
              interval: recurrencePlan.recurrence.interval,
              anchorDueAt: args.dueAt,
              nextDueAt: recurrencePlan.nextDueAt,
              endAt: recurrencePlan.recurrence.endAt,
            }
          : undefined,
      createdAt: now,
      updatedAt: now,
    });

    if (
      recurrencePlan?.shouldCreateFirstOccurrence &&
      recurrencePlan.firstOccurrenceDueAt !== undefined
    ) {
      await insertTaskOccurrence(ctx, {
        userId: user._id,
        title,
        description,
        priority,
        dueAt: recurrencePlan.firstOccurrenceDueAt,
        parentTaskId: taskId,
        recurrenceIndex: 1,
        now,
      });
    }

    return taskId;
  },
});

export const createRecurring = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(taskPriorityValidator),
    dueAt: v.number(),
    recurrence: recurrenceInputValidator,
  },
  returns: v.object({
    taskId: v.id("tasks"),
    nextOccurrenceId: v.optional(v.id("tasks")),
    nextDueAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    const recurrence = normalizeRecurrence(args.recurrence);
    const recurrencePlan = planRecurringTaskCreation(args.dueAt, recurrence);
    const title = args.title.trim();
    const description = args.description?.trim();
    const priority = args.priority ?? "medium";
    const taskId = await ctx.db.insert("tasks", {
      userId: user._id,
      title,
      description,
      status: "todo",
      priority,
      dueAt: args.dueAt,
      recurrence: {
        frequency: recurrencePlan.recurrence.frequency,
        interval: recurrencePlan.recurrence.interval,
        anchorDueAt: args.dueAt,
        nextDueAt: recurrencePlan.nextDueAt,
        endAt: recurrencePlan.recurrence.endAt,
      },
      createdAt: now,
      updatedAt: now,
    });

    let nextOccurrenceId: Id<"tasks"> | undefined;
    if (recurrencePlan.shouldCreateFirstOccurrence) {
      nextOccurrenceId = await insertTaskOccurrence(ctx, {
        userId: user._id,
        title,
        description,
        priority,
        dueAt: recurrencePlan.firstOccurrenceDueAt,
        parentTaskId: taskId,
        recurrenceIndex: 1,
        now,
      });
    }

    return { taskId, nextOccurrenceId, nextDueAt: recurrencePlan.firstOccurrenceDueAt };
  },
});

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    status: v.optional(taskStatusValidator),
    priority: v.optional(taskPriorityValidator),
    dueAt: v.optional(v.union(v.number(), v.null())),
  },
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

export const moveStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: taskStatusValidator,
  },
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
    await ctx.db.patch(args.taskId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { taskId: args.taskId, status: args.status };
  },
});

export const generateNextOccurrence = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.union(
    v.object({
      taskId: v.id("tasks"),
      dueAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id) {
      throw new Error("Task not found");
    }
    if (!task.recurrence) {
      throw new Error("Task is not recurring.");
    }
    const dueAt = task.recurrence.nextDueAt;
    if (task.recurrence.endAt !== undefined && dueAt > task.recurrence.endAt) {
      return null;
    }
    const now = Date.now();
    const nextIndex = (task.recurrenceIndex ?? 0) + 1;
    const occurrenceId = await insertTaskOccurrence(ctx, {
      userId: user._id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueAt,
      parentTaskId: task._id,
      recurrenceIndex: nextIndex,
      now,
    });
    await ctx.db.patch(task._id, {
      recurrence: {
        ...task.recurrence,
        nextDueAt: computeNextOccurrenceDueAt(dueAt, task.recurrence),
      },
      updatedAt: now,
    });
    return { taskId: occurrenceId, dueAt };
  },
});

export const remove = mutation({
  args: { taskId: v.id("tasks") },
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
  },
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
          t.status !== "cancelled",
      )
      .sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0));
  },
});

/** Toggle a task between todo and done. */
export const toggleCompletion = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id) {
      throw new Error("Task not found");
    }
    const next = task.status === "done" ? "todo" : "done";
    await ctx.db.patch(args.taskId, { status: next, updatedAt: Date.now() });
    return { taskId: args.taskId, status: next };
  },
});
