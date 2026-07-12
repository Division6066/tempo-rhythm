import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";
import { liveOnly } from "./lib/soft_delete";

export const list = query({
  args: {
    conversationId: v.id("conversations"),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    if (
      !conversation ||
      conversation.userId !== user._id ||
      conversation.deletedAt !== undefined
    ) {
      throw new Error("Conversation not found or access denied");
    }

    return liveOnly(
      await ctx.db
        .query("messages")
        .withIndex("by_conversationId_createdAt", (q) =>
          q.eq("conversationId", args.conversationId),
        )
        .order("asc")
        .collect(),
    );
  },
});

export const create = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    modelUsed: v.optional(v.string()),
    councilResponse: v.optional(v.any()),
    toolCalls: v.optional(v.any()),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    if (
      !conversation ||
      conversation.userId !== user._id ||
      conversation.deletedAt !== undefined
    ) {
      throw new Error("Conversation not found or access denied");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      modelUsed: args.modelUsed,
      councilResponse: args.councilResponse,
      toolCalls: args.toolCalls,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.conversationId, {
      updatedAt: Date.now(),
    });

    return messageId;
  },
});

export const remove = mutation({
  args: {
    messageId: v.id("messages"),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const message = await ctx.db.get(args.messageId);
    if (!message || message.deletedAt !== undefined) {
      throw new Error("Message not found");
    }

    const conversation = await ctx.db.get(message.conversationId);
    if (
      !conversation ||
      conversation.userId !== user._id ||
      conversation.deletedAt !== undefined
    ) {
      throw new Error("Access denied");
    }

    // messages table has deletedAt but no updatedAt
    await ctx.db.patch(args.messageId, { deletedAt: Date.now() });
    return { success: true };
  },
});
