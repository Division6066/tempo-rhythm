import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";
import { liveOnly, softDeletePatch } from "./lib/soft_delete";

export const list = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const conversations = liveOnly(
      await ctx.db
        .query("conversations")
        .withIndex("by_userId_updatedAt", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect(),
    );
    return conversations;
  },
});

export const get = query({
  args: {
    conversationId: v.id("conversations"),
  },
  returns: v.any(),
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
    return conversation;
  },
});

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    technique: v.optional(v.string()),
  },
  returns: v.id("conversations"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    return ctx.db.insert("conversations", {
      userId: user._id,
      title: args.title || "New Conversation",
      technique: args.technique,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTechnique = mutation({
  args: {
    conversationId: v.id("conversations"),
    technique: v.union(v.string(), v.null()),
  },
  returns: v.object({ success: v.boolean() }),
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

    await ctx.db.patch(args.conversationId, {
      technique: args.technique === null ? undefined : args.technique,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const updateTitle = mutation({
  args: {
    conversationId: v.id("conversations"),
    title: v.string(),
  },
  returns: v.object({ success: v.boolean() }),
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

    await ctx.db.patch(args.conversationId, {
      title: args.title,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const remove = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  returns: v.object({ success: v.boolean() }),
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

    const now = Date.now();
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    for (const message of messages) {
      if (message.deletedAt === undefined) {
        // messages have deletedAt but no updatedAt field
        await ctx.db.patch(message._id, { deletedAt: now });
      }
    }

    await ctx.db.patch(args.conversationId, softDeletePatch(now));
    return { success: true };
  },
});
