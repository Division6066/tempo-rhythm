import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => await ctx.db.query("tags").collect(),
});

export const create = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tags", {
      name: args.name,
      color: args.color,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("tags") },
  handler: async (ctx, args) => await ctx.db.delete(args.id),
});
