import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./_helpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db
      .query("savedFilters")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("savedFilters") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const filter = await ctx.db.get(args.id);
    if (!filter || filter.userId !== userId) return null;
    return filter;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    conditions: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const now = Date.now();
    return await ctx.db.insert("savedFilters", {
      userId,
      name: args.name,
      conditions: args.conditions,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("savedFilters"),
    name: v.optional(v.string()),
    conditions: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const filter = await ctx.db.get(args.id);
    if (!filter || filter.userId !== userId) throw new Error("Not found");
    const { id, ...updates } = args;
    const filtered: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[k] = val;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("savedFilters") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const filter = await ctx.db.get(args.id);
    if (!filter || filter.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
