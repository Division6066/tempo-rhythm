import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireUser } from './lib/requireUser';

// Query: Get all conversations for a user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const conversations = await ctx.db
      .query('conversations')
      .withIndex('by_userId_deletedAt', (q) =>
        q.eq('userId', user._id).eq('deletedAt', undefined),
      )
      .collect();

    return conversations.toSorted((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Query: Get a single conversation
export const get = query({
  args: {
    conversationId: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== user._id || conversation.deletedAt !== undefined) {
      throw new Error('Conversation not found or access denied');
    }

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
    const conversationId = await ctx.db.insert('conversations', {
      userId: user._id,
      title: args.title || 'New Conversation',
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
    conversationId: v.id('conversations'),
    technique: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== user._id || conversation.deletedAt !== undefined) {
      throw new Error('Conversation not found or access denied');
    }

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
    conversationId: v.id('conversations'),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== user._id || conversation.deletedAt !== undefined) {
      throw new Error('Conversation not found or access denied');
    }

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
    conversationId: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== user._id || conversation.deletedAt !== undefined) {
      throw new Error('Conversation not found or access denied');
    }

    const now = Date.now();

    // Soft-delete all messages in this conversation first.
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversationId_deletedAt', (q) =>
        q.eq('conversationId', args.conversationId).eq('deletedAt', undefined),
      )
      .collect();

    for (const message of messages) {
      await ctx.db.patch(message._id, { deletedAt: now });
    }

    await ctx.db.patch(args.conversationId, { deletedAt: now, updatedAt: now });

    return { success: true };
  },
});

