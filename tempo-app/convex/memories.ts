import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => await ctx.db.query("memories").collect(),
});

export const create = mutation({
  args: {
    tier: v.optional(v.string()),
    content: v.string(),
    decay: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("memories", {
      tier: args.tier ?? "warm",
      content: args.content,
      decay: args.decay ?? 100,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => await ctx.db.delete(args.id),
});
