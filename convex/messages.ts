import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, type QueryCtx, query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

const messageRoleValidator = v.union(
  v.literal("user"),
  v.literal("assistant"),
  v.literal("system")
);

async function requireOwnedLiveConversation(
  ctx: QueryCtx | MutationCtx,
  conversationId: Id<"conversations">
) {
  const user = await requireUser(ctx);
  const conversation = await ctx.db.get(conversationId);
  if (!conversation || conversation.userId !== user._id || conversation.deletedAt !== undefined) {
    throw new Error("Conversation not found or access denied");
  }
  return { user, conversation };
}

// Query: Get live messages for a live conversation
export const list = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    await requireOwnedLiveConversation(ctx, args.conversationId);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId_deletedAt", (q) =>
        q.eq("conversationId", args.conversationId).eq("deletedAt", undefined)
      )
      .collect();

    messages.sort((a, b) => a.createdAt - b.createdAt);
    return messages;
  },
});

const searchHitValidator = v.object({
  conversationId: v.id("conversations"),
  messageId: v.id("messages"),
  role: messageRoleValidator,
  content: v.string(),
  createdAt: v.number(),
});

/** Case-insensitive search across the caller's live chats. One match per conversation, 200 conversations, the 80 newest live messages each. */
export const searchMine = query({
  args: { query: v.string() },
  returns: v.array(searchHitValidator),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const needle = args.query.trim();
    if (needle.length === 0) {
      return [];
    }
    const bounded = needle.slice(0, 200);

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_userId_deletedAt", (q) => q.eq("userId", user._id).eq("deletedAt", undefined))
      .collect();

    const lower = bounded.toLowerCase();
    const hits: Array<{
      conversationId: Id<"conversations">;
      messageId: Id<"messages">;
      role: "user" | "assistant" | "system";
      content: string;
      createdAt: number;
    }> = [];

    for (const conversation of conversations) {
      if (hits.length >= 200) {
        break;
      }
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversationId_deletedAt", (q) =>
          q.eq("conversationId", conversation._id).eq("deletedAt", undefined)
        )
        .order("desc")
        .take(80);

      for (const message of messages) {
        if (!message.content.toLowerCase().includes(lower)) {
          continue;
        }
        hits.push({
          conversationId: conversation._id,
          messageId: message._id,
          role: message.role,
          content: message.content,
          createdAt: message.createdAt,
        });
        break;
      }
    }

    return hits;
  },
});

// Mutation: Add a message to a conversation
export const create = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: messageRoleValidator,
    content: v.string(),
    modelUsed: v.optional(v.string()),
    councilResponse: v.optional(v.any()),
    toolCalls: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireOwnedLiveConversation(ctx, args.conversationId);

    if (args.role !== "user") {
      throw new Error("Only user messages can be created from the client");
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

// Mutation: Delete a message
export const remove = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const message = await ctx.db.get(args.messageId);
    if (!message || message.deletedAt !== undefined) {
      throw new Error("Message not found");
    }

    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation || conversation.userId !== user._id || conversation.deletedAt !== undefined) {
      throw new Error("Access denied");
    }

    await ctx.db.delete(args.messageId);
    return { success: true };
  },
});
