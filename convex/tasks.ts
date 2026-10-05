import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";
import { isRestorable, undoUntil } from "./lib/softDelete";
import { filterTasksDueInRange } from "./lib/task_filters";
import { normalizeChecklist } from "./lib/taskChecklists";
import { assertRepeatEvery, planNextRepeatInstance } from "./lib/taskRepeat";
import { fetchCurrentUser } from "./users";

const checklistItemValidator = v.object({
  id: v.string(),
  text: v.string(),
  completed: v.boolean(),
});

const taskStatusValidator = v.union(
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("done"),
  v.literal("cancelled")
);

const taskPriorityValidator = v.union(v.literal("low"), v.literal("medium"), v.literal("high"));
const taskEnergyValidator = v.union(v.literal("low"), v.literal("medium"), v.literal("high"));

const taskFlexibilityValidator = v.union(v.literal("fixed"), v.literal("elastic"));

const taskReturnValidator = v.object({
  _id: v.id("tasks"),
  _creationTime: v.number(),
  userId: v.id("users"),
  title: v.string(),
  description: v.optional(v.string()),
  status: taskStatusValidator,
  priority: taskPriorityValidator,
  energy: v.optional(taskEnergyValidator),
  timeEstimate: v.optional(v.number()),
  flexibility: v.optional(taskFlexibilityValidator),
  timeSpentOnDay: v.optional(v.any()),
  repeatCfgId: v.optional(v.id("taskRepeatCfgs")),
  parentTaskId: v.optional(v.id("tasks")),
  projectId: v.optional(v.string()),
  projectName: v.optional(v.string()),
  dueAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  checklist: v.optional(v.array(checklistItemValidator)),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

export const list = query({
  args: {
    status: v.optional(taskStatusValidator),
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
      .withIndex("by_userId_deletedAt", (q) => q.eq("userId", user._id).eq("deletedAt", undefined))
      .collect();

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
          t.title.toLowerCase().includes(q) || (t.description?.toLowerCase().includes(q) ?? false)
      );
    }
    if (args.dueFrom !== undefined && args.dueTo !== undefined) {
      rows = filterTasksDueInRange(rows, args.dueFrom, args.dueTo, {
        excludeCancelled: false,
      });
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
    return filterTasksDueInRange(rows, args.startMs, args.endMs);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(taskStatusValidator),
    priority: v.optional(taskPriorityValidator),
    energy: v.optional(taskEnergyValidator),
    flexibility: v.optional(taskFlexibilityValidator),
    timeEstimate: v.optional(v.number()),
    projectId: v.optional(v.string()),
    projectName: v.optional(v.string()),
    dueAt: v.optional(v.number()),
    checklist: v.optional(v.array(checklistItemValidator)),
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
      ...(args.flexibility !== undefined ? { flexibility: args.flexibility } : {}),
      ...(args.timeEstimate !== undefined ? { timeEstimate: args.timeEstimate } : {}),
      projectId: args.projectId?.trim(),
      projectName: args.projectName?.trim(),
      dueAt: args.dueAt,
      checklist: normalizeChecklist(args.checklist),
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
    energy: v.optional(taskEnergyValidator),
    flexibility: v.optional(taskFlexibilityValidator),
    timeEstimate: v.optional(v.union(v.number(), v.null())),
    projectId: v.optional(v.union(v.string(), v.null())),
    projectName: v.optional(v.union(v.string(), v.null())),
    dueAt: v.optional(v.union(v.number(), v.null())),
    checklist: v.optional(v.union(v.array(checklistItemValidator), v.null())),
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
    if (args.status !== undefined) {
      patch.status = args.status;
      if (args.status === "done" && task.status !== "done") {
        patch.completedAt = now;
      } else if (args.status !== "done" && task.status === "done") {
        patch.completedAt = undefined;
      }
    }
    if (args.priority !== undefined) patch.priority = args.priority;
    if (args.energy !== undefined) patch.energy = args.energy;
    if (args.flexibility !== undefined) patch.flexibility = args.flexibility;
    if (args.timeEstimate !== undefined) {
      patch.timeEstimate = args.timeEstimate === null ? undefined : args.timeEstimate;
    }
    if (args.projectId !== undefined) {
      patch.projectId = args.projectId === null ? undefined : args.projectId.trim();
    }
    if (args.projectName !== undefined) {
      patch.projectName = args.projectName === null ? undefined : args.projectName.trim();
    }
    if (args.dueAt !== undefined) {
      patch.dueAt = args.dueAt === null ? undefined : args.dueAt;
    }
    if (args.checklist !== undefined) {
      patch.checklist = args.checklist === null ? undefined : normalizeChecklist(args.checklist);
    }
    await ctx.db.patch(args.taskId, patch as typeof task);
    if (args.status === "done" && task.status !== "done") {
      await spawnRepeatAfterCompletion(ctx, user._id, task, now);
    }
    return args.taskId;
  },
});

export const remove = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.object({ success: v.boolean(), undoUntilMs: v.number() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id || task.deletedAt !== undefined) {
      throw new Error("Task not found");
    }
    const now = Date.now();
    await ctx.db.patch(args.taskId, { deletedAt: now, updatedAt: now });
    return { success: true, undoUntilMs: undoUntil(now) };
  },
});

export const restore = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id) {
      throw new Error("Task not found");
    }
    const now = Date.now();
    if (!isRestorable(task.deletedAt, now)) {
      return { success: false };
    }
    await ctx.db.patch(args.taskId, { deletedAt: undefined, updatedAt: now });
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
      .withIndex("by_userId_deletedAt", (q) => q.eq("userId", user._id).eq("deletedAt", undefined))
      .collect();
    return filterTasksDueInRange(rows, args.dueFrom, args.dueTo).sort(
      (a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0)
    );
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
    const now = Date.now();
    const next: "todo" | "done" = task.status === "done" ? "todo" : "done";
    await ctx.db.patch(args.taskId, {
      status: next,
      updatedAt: now,
      completedAt: next === "done" ? now : undefined,
    });
    if (next === "done") {
      await spawnRepeatAfterCompletion(ctx, user._id, task, now);
    }
    return { taskId: args.taskId, status: next };
  },
});

async function spawnRepeatAfterCompletion(
  ctx: MutationCtx,
  userId: Id<"users">,
  task: Doc<"tasks">,
  now: number
): Promise<void> {
  if (!task.repeatCfgId) {
    return;
  }
  const cfg = await ctx.db.get(task.repeatCfgId);
  if (!cfg || cfg.userId !== userId) {
    return;
  }
  const spawned = planNextRepeatInstance({
    dueAt: task.dueAt,
    completedAt: now,
    nowMs: now,
    cfg,
  });
  if (!spawned) {
    return;
  }
  await ctx.db.insert("tasks", {
    userId,
    title: task.title,
    ...(task.description !== undefined ? { description: task.description } : {}),
    status: "todo",
    priority: task.priority,
    ...(task.energy !== undefined ? { energy: task.energy } : {}),
    ...(task.timeEstimate !== undefined ? { timeEstimate: task.timeEstimate } : {}),
    repeatCfgId: cfg._id,
    ...(task.projectId !== undefined ? { projectId: task.projectId } : {}),
    ...(task.projectName !== undefined ? { projectName: task.projectName } : {}),
    dueAt: spawned.dueAt,
    ...(task.checklist
      ? {
          checklist: task.checklist.map((item) => ({ ...item, completed: false })),
        }
      : {}),
    createdAt: now,
    updatedAt: now,
  });
  await ctx.db.patch(cfg._id, {
    lastTaskCreationDay: spawned.dayKey,
    updatedAt: now,
  });
}

const repeatCycleValidator = v.union(
  v.literal("DAILY"),
  v.literal("WEEKLY"),
  v.literal("MONTHLY"),
  v.literal("YEARLY")
);

const repeatCfgReturnValidator = v.object({
  _id: v.id("taskRepeatCfgs"),
  _creationTime: v.number(),
  userId: v.id("users"),
  repeatCycle: repeatCycleValidator,
  repeatEvery: v.number(),
  weekdays: v.array(v.number()),
  monthlyWeekOfMonth: v.optional(v.number()),
  monthlyWeekday: v.optional(v.number()),
  monthlyLastDay: v.optional(v.boolean()),
  deletedInstanceDates: v.array(v.string()),
  skipOverdue: v.boolean(),
  waitForCompletion: v.boolean(),
  repeatFromCompletionDate: v.boolean(),
  isPaused: v.boolean(),
  defaultEstimate: v.optional(v.number()),
  lastTaskCreationDay: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
});

export const listRepeatCfgs = query({
  args: {},
  returns: v.array(repeatCfgReturnValidator),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const rows = await ctx.db
      .query("taskRepeatCfgs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    return rows.filter((row) => row.deletedAt === undefined);
  },
});

export const createRepeatCfg = mutation({
  args: {
    repeatCycle: repeatCycleValidator,
    repeatEvery: v.optional(v.number()),
    weekdays: v.optional(v.array(v.number())),
    monthlyLastDay: v.optional(v.boolean()),
    skipOverdue: v.optional(v.boolean()),
    waitForCompletion: v.optional(v.boolean()),
    repeatFromCompletionDate: v.optional(v.boolean()),
  },
  returns: v.id("taskRepeatCfgs"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const repeatEvery = assertRepeatEvery(args.repeatEvery ?? 1);
    const now = Date.now();
    return ctx.db.insert("taskRepeatCfgs", {
      userId: user._id,
      repeatCycle: args.repeatCycle,
      repeatEvery,
      weekdays: args.weekdays ?? [],
      monthlyLastDay: args.monthlyLastDay,
      deletedInstanceDates: [],
      skipOverdue: args.skipOverdue ?? true,
      waitForCompletion: args.waitForCompletion ?? false,
      repeatFromCompletionDate: args.repeatFromCompletionDate ?? false,
      isPaused: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const pauseRepeatCfg = mutation({
  args: {
    repeatCfgId: v.id("taskRepeatCfgs"),
    isPaused: v.boolean(),
  },
  returns: v.id("taskRepeatCfgs"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const cfg = await ctx.db.get(args.repeatCfgId);
    if (!cfg || cfg.userId !== user._id || cfg.deletedAt !== undefined) {
      throw new Error("Repeat series not found");
    }
    await ctx.db.patch(args.repeatCfgId, {
      isPaused: args.isPaused,
      updatedAt: Date.now(),
    });
    return args.repeatCfgId;
  },
});

export const setTaskRepeatCfg = mutation({
  args: {
    taskId: v.id("tasks"),
    repeatCfgId: v.union(v.id("taskRepeatCfgs"), v.null()),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id || task.deletedAt !== undefined) {
      throw new Error("Task not found");
    }
    if (args.repeatCfgId !== null) {
      const cfg = await ctx.db.get(args.repeatCfgId);
      if (!cfg || cfg.userId !== user._id || cfg.deletedAt !== undefined) {
        throw new Error("Repeat series not found");
      }
    }
    await ctx.db.patch(args.taskId, {
      repeatCfgId: args.repeatCfgId === null ? undefined : args.repeatCfgId,
      updatedAt: Date.now(),
    });
    return args.taskId;
  },
});
