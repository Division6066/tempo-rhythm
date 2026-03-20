import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./_helpers";

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
    const limit = args.limit ?? 50;
    return messages.slice(-limit);
  },
});

export const create = mutation({
  args: {
    role: v.string(),
    content: v.string(),
    suggestions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db.insert("chatMessages", {
      userId,
      role: args.role,
      content: args.content,
      suggestions: args.suggestions,
      createdAt: Date.now(),
    });
  },
});

export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
  },
});
