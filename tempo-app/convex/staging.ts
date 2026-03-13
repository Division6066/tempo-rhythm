import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./_helpers";

export const listPending = query({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const all = await ctx.db
      .query("stagedSuggestions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    const pending = all.filter((s) => s.status === "pending");
    if (args.type) return pending.filter((s) => s.type === args.type);
    return pending;
  },
});

export const get = query({
  args: { id: v.id("stagedSuggestions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const suggestion = await ctx.db.get(args.id);
    if (!suggestion || suggestion.userId !== userId) return null;
    return suggestion;
  },
});

export const create = mutation({
  args: {
    type: v.string(),
    data: v.any(),
    reasoning: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db.insert("stagedSuggestions", {
      userId,
      type: args.type,
      data: args.data,
      reasoning: args.reasoning,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const accept = mutation({
  args: { id: v.id("stagedSuggestions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const suggestion = await ctx.db.get(args.id);
    if (!suggestion || suggestion.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, { status: "accepted", resolvedAt: Date.now() });
    return suggestion;
  },
});

export const reject = mutation({
  args: { id: v.id("stagedSuggestions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const suggestion = await ctx.db.get(args.id);
    if (!suggestion || suggestion.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, { status: "rejected", resolvedAt: Date.now() });
  },
});

export const updateData = mutation({
  args: {
    id: v.id("stagedSuggestions"),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const suggestion = await ctx.db.get(args.id);
    if (!suggestion || suggestion.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, { data: args.data });
  },
});
