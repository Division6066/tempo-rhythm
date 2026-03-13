import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => await ctx.db.query("folders").collect(),
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    parentFolderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("folders", {
      name: args.name,
      description: args.description,
      parentFolderId: args.parentFolderId,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("folders"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[k] = val;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("folders") },
  handler: async (ctx, args) => await ctx.db.delete(args.id),
});
