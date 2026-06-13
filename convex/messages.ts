import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireUser } from './lib/requireUser';

// Query: Get all messages for a conversation
export const list = query({
  args: {
    conversationId: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // Verify conversation belongs to user
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== user._id) {
      throw new Error('Conversation not found or access denied');
    }

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversationId_createdAt', (q) => q.eq('conversationId', args.conversationId))
      .order('asc')
      .collect();

    return messages;
  },
});

// Mutation: Add a message to a conversation
export const create = mutation({
  args: {
    conversationId: v.id('conversations'),
    content: v.string(),
    modelUsed: v.optional(v.string()),
    councilResponse: v.optional(v.any()),
    toolCalls: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // Verify conversation belongs to user
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== user._id) {
      throw new Error('Conversation not found or access denied');
    }

    const messageId = await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      role: 'user',
      content: args.content,
      modelUsed: args.modelUsed,
      councilResponse: args.councilResponse,
      toolCalls: args.toolCalls,
      createdAt: Date.now(),
    });

    // Update conversation's updatedAt timestamp
    await ctx.db.patch(args.conversationId, {
      updatedAt: Date.now(),
    });

    return messageId;
  },
});

// Mutation: Delete a message
export const remove = mutation({
  args: {
    messageId: v.id('messages'),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Verify conversation belongs to user
    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation || conversation.userId !== user._id) {
      throw new Error('Access denied');
    }

    await ctx.db.delete(args.messageId);
    return { success: true };
  },
});

