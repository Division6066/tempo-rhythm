import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => await ctx.db.query("projects").collect(),
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
    color: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      folderId: args.folderId,
      color: args.color,
      status: args.status ?? "active",
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
  args: { id: v.id("projects") },
  handler: async (ctx, args) => await ctx.db.delete(args.id),
});
