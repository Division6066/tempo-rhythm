import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => await ctx.db.query("notes").collect(),
});

export const get = query({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => await ctx.db.get(args.id),
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("notes", {
      title: args.title,
      content: args.content ?? "",
      projectId: args.projectId,
      folderId: args.folderId,
      tags: args.tags ?? [],
      templateType: args.templateType,
      isPinned: args.isPinned ?? false,
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
  args: { id: v.id("notes") },
  handler: async (ctx, args) => await ctx.db.delete(args.id),
});
