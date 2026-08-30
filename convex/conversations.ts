import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireUser } from './lib/requireUser';
import { filterLive, isLive, softDeleteOnly, softDeleteWithUpdatedAt } from './lib/softDelete';

// Query: Get all conversations for a user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const conversations = await ctx.db
      .query('conversations')
      .withIndex('by_userId_updatedAt', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect();

    return filterLive(conversations);
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
    if (!isLive(conversation) || conversation.userId !== user._id) {
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
    if (!isLive(conversation) || conversation.userId !== user._id) {
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
    if (!isLive(conversation) || conversation.userId !== user._id) {
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
    if (!isLive(conversation) || conversation.userId !== user._id) {
      throw new Error('Conversation not found or access denied');
    }

    // Hide all live messages in this conversation first.
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversationId', (q) => q.eq('conversationId', args.conversationId))
      .collect();

    const now = Date.now();
    for (const message of filterLive(messages)) {
      await ctx.db.patch(message._id, softDeleteOnly(now));
    }

    await ctx.db.patch(args.conversationId, softDeleteWithUpdatedAt(now));

    return { success: true };
  },
});

