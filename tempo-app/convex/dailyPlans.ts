import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./_helpers";

export const list = query({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (args.date) {
      return await ctx.db
        .query("dailyPlans")
        .withIndex("by_date", (q) => q.eq("date", args.date!))
        .filter((q) => q.eq(q.field("userId"), userId))
        .collect();
    }
    return await ctx.db
      .query("dailyPlans")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("dailyPlans") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const plan = await ctx.db.get(args.id);
    if (!plan || plan.userId !== userId) return null;
    return plan;
  },
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
    const userId = await getAuthUserId(ctx);
    const now = Date.now();
    return await ctx.db.insert("dailyPlans", {
      userId,
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
    const userId = await getAuthUserId(ctx);
    const plan = await ctx.db.get(args.id);
    if (!plan || plan.userId !== userId) throw new Error("Not found");
    const { id, ...updates } = args;
    const filtered: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[k] = val;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const getDailyPlan = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const plan = await ctx.db
      .query("dailyPlans")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).eq("date", args.date)
      )
      .first();
    return plan ?? null;
  },
});

export const getOrCreateDailyPlan = mutation({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const existing = await ctx.db
      .query("dailyPlans")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).eq("date", args.date)
      )
      .first();
    if (existing) return existing;
    const now = Date.now();
    const id = await ctx.db.insert("dailyPlans", {
      userId,
      date: args.date,
      blocks: [],
      aiGenerated: false,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(id);
  },
});

export const updateDailyPlan = mutation({
  args: {
    id: v.id("dailyPlans"),
    blocks: v.optional(v.any()),
    mood: v.optional(v.string()),
    energyLevel: v.optional(v.number()),
    acceptedAt: v.optional(v.number()),
    topThree: v.optional(v.array(v.string())),
    reflectionNote: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const plan = await ctx.db.get(args.id);
    if (!plan || plan.userId !== userId) throw new Error("Not found");
    const { id, ...updates } = args;
    const filtered: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[k] = val;
    }
    await ctx.db.patch(id, filtered);
  },
});
