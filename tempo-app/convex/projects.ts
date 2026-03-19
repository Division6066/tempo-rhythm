import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./_helpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) return null;
    return project;
  },
});

export const listByFolder = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .collect();
    return projects
      .filter((p) => p.userId === userId)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
    color: v.optional(v.string()),
    status: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const now = Date.now();
    return await ctx.db.insert("projects", {
      userId,
      name: args.name,
      description: args.description,
      folderId: args.folderId,
      color: args.color,
      status: args.status ?? "active",
      sortOrder: args.sortOrder,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) throw new Error("Not found");
    const { id, ...updates } = args;
    const filtered: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[k] = val;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const reorder = mutation({
  args: { projectIds: v.array(v.id("projects")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    for (let i = 0; i < args.projectIds.length; i++) {
      const project = await ctx.db.get(args.projectIds[i]);
      if (!project || project.userId !== userId) continue;
      await ctx.db.patch(args.projectIds[i], { sortOrder: i, updatedAt: Date.now() });
    }
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});

export const getTaskCount = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
    return tasks.filter((t) => t.userId === userId && t.status !== "done").length;
  },
});
