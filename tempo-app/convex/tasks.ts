import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./_helpers";

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const all = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    if (args.status) {
      return all.filter((t) => t.status === args.status);
    }
    return all;
  },
});

export const listByDateRange = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const all = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return all.filter(
      (t) =>
        t.scheduledDate &&
        t.scheduledDate >= args.startDate &&
        t.scheduledDate <= args.endDate
    );
  },
});

export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) return null;
    return task;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    folderId: v.optional(v.id("folders")),
    tags: v.optional(v.array(v.string())),
    dueDate: v.optional(v.string()),
    scheduledDate: v.optional(v.string()),
    estimatedMinutes: v.optional(v.number()),
    notes: v.optional(v.string()),
    parentTaskId: v.optional(v.id("tasks")),
    aiGenerated: v.optional(v.boolean()),
    startTime: v.optional(v.string()),
    duration: v.optional(v.number()),
    recurrenceRule: v.optional(v.string()),
    recurrenceEndDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      userId,
      title: args.title,
      status: args.status ?? "inbox",
      priority: args.priority ?? "medium",
      projectId: args.projectId,
      folderId: args.folderId,
      tags: args.tags ?? [],
      dueDate: args.dueDate,
      scheduledDate: args.scheduledDate,
      estimatedMinutes: args.estimatedMinutes,
      notes: args.notes,
      parentTaskId: args.parentTaskId,
      aiGenerated: args.aiGenerated ?? false,
      startTime: args.startTime,
      duration: args.duration,
      recurrenceRule: args.recurrenceRule,
      recurrenceEndDate: args.recurrenceEndDate,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    notes: v.optional(v.string()),
    estimatedMinutes: v.optional(v.union(v.number(), v.null())),
    tags: v.optional(v.array(v.string())),
    dueDate: v.optional(v.string()),
    scheduledDate: v.optional(v.union(v.string(), v.null())),
    startTime: v.optional(v.union(v.string(), v.null())),
    duration: v.optional(v.union(v.number(), v.null())),
    recurrenceRule: v.optional(v.union(v.string(), v.null())),
    recurrenceEndDate: v.optional(v.union(v.string(), v.null())),
    completedAt: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");
    const { id, ...updates } = args;
    const filtered: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[k] = val;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const complete = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");

    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: "done",
      completedAt: now,
      updatedAt: now,
    });

    if (task.recurrenceRule && task.scheduledDate) {
      const nextDate = getNextOccurrence(task.scheduledDate, task.recurrenceRule);
      if (nextDate && (!task.recurrenceEndDate || nextDate <= task.recurrenceEndDate)) {
        await ctx.db.insert("tasks", {
          userId,
          title: task.title,
          status: "scheduled",
          priority: task.priority,
          projectId: task.projectId,
          folderId: task.folderId,
          tags: task.tags,
          scheduledDate: nextDate,
          estimatedMinutes: task.estimatedMinutes,
          notes: task.notes,
          parentTaskId: task.parentTaskId,
          aiGenerated: false,
          startTime: task.startTime,
          duration: task.duration,
          recurrenceRule: task.recurrenceRule,
          recurrenceEndDate: task.recurrenceEndDate,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});

function getNextOccurrence(currentDate: string, rule: string): string | null {
  const d = new Date(currentDate + "T00:00:00");
  switch (rule) {
    case "daily":
      d.setDate(d.getDate() + 1);
      break;
    case "weekdays":
      do {
        d.setDate(d.getDate() + 1);
      } while (d.getDay() === 0 || d.getDay() === 6);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "biweekly":
      d.setDate(d.getDate() + 14);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      return null;
  }
  return d.toISOString().split("T")[0];
}
