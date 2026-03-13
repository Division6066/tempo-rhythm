import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./_helpers";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db
      .query("preferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

export const upsert = mutation({
  args: {
    wakeTime: v.optional(v.string()),
    sleepTime: v.optional(v.string()),
    energyPeaks: v.optional(v.array(v.string())),
    prepBufferMinutes: v.optional(v.number()),
    planningStyle: v.optional(v.string()),
    adhdMode: v.optional(v.boolean()),
    focusSessionMinutes: v.optional(v.number()),
    breakMinutes: v.optional(v.number()),
    onboardingComplete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const existing = await ctx.db
      .query("preferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    const now = Date.now();
    const updates: Record<string, unknown> = { updatedAt: now };
    for (const [k, val] of Object.entries(args)) {
      if (val !== undefined) updates[k] = val;
    }
    if (existing) {
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    }
    return await ctx.db.insert("preferences", {
      userId,
      wakeTime: args.wakeTime ?? "07:00",
      sleepTime: args.sleepTime ?? "23:00",
      energyPeaks: args.energyPeaks ?? [],
      prepBufferMinutes: args.prepBufferMinutes ?? 30,
      planningStyle: args.planningStyle ?? "morning",
      adhdMode: args.adhdMode ?? true,
      focusSessionMinutes: args.focusSessionMinutes ?? 25,
      breakMinutes: args.breakMinutes ?? 5,
      onboardingComplete: args.onboardingComplete ?? false,
      updatedAt: now,
    });
  },
});
