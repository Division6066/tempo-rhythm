import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

async function requireOwnedLiveConversation(
  ctx: QueryCtx | MutationCtx,
  conversationId: Id<"conversations">,
): Promise<{ userId: Id<"users">; conversation: Doc<"conversations"> }> {
  const user = await requireUser(ctx);
  const conversation = await ctx.db.get(conversationId);
  if (!conversation || conversation.userId !== user._id || conversation.deletedAt !== undefined) {
    throw new Error("Conversation not found or access denied");
  }
  return { userId: user._id, conversation };
}

// Query: Get live conversations for the signed-in user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_userId_deletedAt", (q) =>
        q.eq("userId", user._id).eq("deletedAt", undefined),
      )
      .collect();

    conversations.sort((a, b) => b.updatedAt - a.updatedAt);
    return conversations;
  },
});

// Query: Get a single live conversation
export const get = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const { conversation } = await requireOwnedLiveConversation(ctx, args.conversationId);
    return conversation;
  },
});

// Mutation: Create a new conversation
export const create = mutation({
  args: {
    title: v.optional(v.string()),
    technique: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const now = Date.now();
    const conversationId = await ctx.db.insert("conversations", {
      userId: user._id,
      title: args.title || "New Conversation",
      technique: args.technique,
      createdAt: now,
      updatedAt: now,
    });

    return conversationId;
  },
});

// Mutation: Update coach technique (optional)
export const updateTechnique = mutation({
  args: {
    conversationId: v.id("conversations"),
    technique: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    await requireOwnedLiveConversation(ctx, args.conversationId);

    await ctx.db.patch(args.conversationId, {
      technique: args.technique === null ? undefined : args.technique,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Mutation: Update conversation title
export const updateTitle = mutation({
  args: {
    conversationId: v.id("conversations"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await requireOwnedLiveConversation(ctx, args.conversationId);

    await ctx.db.patch(args.conversationId, {
      title: args.title,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Mutation: Delete a conversation
export const remove = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    await requireOwnedLiveConversation(ctx, args.conversationId);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    await ctx.db.delete(args.conversationId);

    return { success: true };
  },
});
