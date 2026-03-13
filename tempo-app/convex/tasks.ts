import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    }
    return await ctx.db.query("tasks").collect();
  },
});

export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => await ctx.db.get(args.id),
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("tasks", {
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
    scheduledDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[k] = val;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => await ctx.db.delete(args.id),
});
