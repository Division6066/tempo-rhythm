import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.date) {
      return await ctx.db
        .query("dailyPlans")
        .withIndex("by_date", (q) => q.eq("date", args.date!))
        .collect();
    }
    return await ctx.db.query("dailyPlans").collect();
  },
});

export const get = query({
  args: { id: v.id("dailyPlans") },
  handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const create = mutation({
  args: {
    date: v.string(),
    blocks: v.any(),
    mood: v.optional(v.string()),
    energyLevel: v.optional(v.number()),
    aiGenerated: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("dailyPlans", {
      date: args.date,
      blocks: args.blocks ?? [],
      mood: args.mood,
      energyLevel: args.energyLevel,
      aiGenerated: args.aiGenerated ?? false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("dailyPlans"),
    blocks: v.optional(v.any()),
    mood: v.optional(v.string()),
    energyLevel: v.optional(v.number()),
    acceptedAt: v.optional(v.number()),
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
