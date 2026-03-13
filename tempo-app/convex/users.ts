import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return { identity };
  },
});

export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const upsertProfile = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        fullName: args.fullName,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("profiles", {
      userId: args.userId,
      fullName: args.fullName,
      role: "user",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});
