import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId, getOptionalAuthUserId } from "./_helpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const all = await ctx.db
      .query("notes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return all.filter((n) => !n.periodType);
  },
});

export const listPeriodNotes = query({
  args: { periodType: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const all = await ctx.db
      .query("notes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    if (args.periodType) {
      return all.filter((n) => n.periodType === args.periodType);
    }
    return all.filter((n) => !!n.periodType);
  },
});

export const getByPeriod = query({
  args: { periodType: v.string(), periodDate: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const all = await ctx.db
      .query("notes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return all.find(
      (n) => n.periodType === args.periodType && n.periodDate === args.periodDate
    ) || null;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const note = await ctx.db
      .query("notes")
      .withIndex("by_publishSlug", (q) => q.eq("publishSlug", args.slug))
      .first();
    if (!note || !note.isPublished) return null;
    return { title: note.title, content: note.content, updatedAt: note.updatedAt };
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const all = await ctx.db
      .query("notes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    const q = args.query.toLowerCase();
    return all.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    ).slice(0, 20);
  },
});

export const get = query({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== userId) return null;
    return note;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    folderId: v.optional(v.id("folders")),
    tags: v.optional(v.array(v.string())),
    templateType: v.optional(v.string()),
    isPinned: v.optional(v.boolean()),
    periodType: v.optional(v.string()),
    periodDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const now = Date.now();
    return await ctx.db.insert("notes", {
      userId,
      title: args.title,
      content: args.content ?? "",
      projectId: args.projectId,
      folderId: args.folderId,
      tags: args.tags ?? [],
      templateType: args.templateType,
      isPinned: args.isPinned ?? false,
      periodType: args.periodType,
      periodDate: args.periodDate,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    isPinned: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    isPublished: v.optional(v.boolean()),
    publishSlug: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== userId) throw new Error("Not found");
    const { id, ...updates } = args;
    const filtered: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[k] = val;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
