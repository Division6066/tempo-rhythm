import { v } from 'convex/values';
import { mutation, query, action } from './_generated/server';
import { api } from './_generated/api';
import { filterLive, isLive, softDeleteWithUpdatedAt } from './lib/softDelete';

// Memory sector type
export type MemorySector = 'semantic' | 'episodic' | 'procedural' | 'emotional' | 'general';

// Query: Get all memories for a user, optionally filtered by sector
export const queryMemories = query({
  args: {
    sector: v.optional(v.union(
      v.literal('semantic'),
      v.literal('episodic'),
      v.literal('procedural'),
      v.literal('emotional'),
      v.literal('general')
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Find user by email
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', identity.email!))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    let query = ctx.db
      .query('memories')
      .withIndex('by_userId_salience', (q) => q.eq('userId', user._id));

    const memories = await query
      .order('desc')
      .collect();

    // Filter by sector if provided
    let filtered = args.sector
      ? filterLive(memories).filter((m) => m.sector === args.sector)
      : filterLive(memories);

    // Sort by salience (descending) and lastAccessed (descending)
    filtered.sort((a, b) => {
      if (b.salience !== a.salience) {
        return b.salience - a.salience;
      }
      return b.lastAccessed - a.lastAccessed;
    });

    // Apply limit
    if (args.limit) {
      filtered = filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

// Mutation: Add a new memory
export const addMemory = mutation({
  args: {
    content: v.string(),
    sector: v.optional(v.union(
      v.literal('semantic'),
      v.literal('episodic'),
      v.literal('procedural'),
      v.literal('emotional'),
      v.literal('general')
    )),
    salience: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', identity.email!))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    const now = Date.now();
    const memoryId = await ctx.db.insert('memories', {
      userId: user._id,
      content: args.content,
      sector: args.sector || 'general',
      salience: args.salience ?? 0.5,
      decayRate: 0.1,
      lastAccessed: now,
      accessCount: 0,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });

    return memoryId;
  },
});

// Mutation: Update memory salience
export const updateSalience = mutation({
  args: {
    memoryId: v.id('memories'),
    salience: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', identity.email!))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    const memory = await ctx.db.get(args.memoryId);
    if (!isLive(memory) || memory.userId !== user._id) {
      throw new Error('Memory not found or access denied');
    }

    // Clamp salience between 0.1 and 1.0
    const clampedSalience = Math.max(0.1, Math.min(1.0, args.salience));

    await ctx.db.patch(args.memoryId, {
      salience: clampedSalience,
      lastAccessed: Date.now(),
      accessCount: memory.accessCount + 1,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Mutation: Delete a memory
export const deleteMemory = mutation({
  args: {
    memoryId: v.id('memories'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', identity.email!))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    const memory = await ctx.db.get(args.memoryId);
    if (!isLive(memory) || memory.userId !== user._id) {
      throw new Error('Memory not found or access denied');
    }

    await ctx.db.patch(args.memoryId, softDeleteWithUpdatedAt());
    return { success: true };
  },
});

// Action: Apply decay to memories (reduces salience over time)
export const decayMemories = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const memories = await ctx.runQuery(api.memories.queryMemories, {});

    const now = Date.now();
    let updated = 0;

    for (const memory of memories) {
      const daysSinceAccess = (now - memory.lastAccessed) / (1000 * 60 * 60 * 24);

      if (daysSinceAccess > 1) {
        const newSalience = Math.max(
          0.1,
          memory.salience * (1 - memory.decayRate * daysSinceAccess)
        );

        if (newSalience < memory.salience) {
          await ctx.runMutation(api.memories.updateSalience, {
            memoryId: memory._id,
            salience: newSalience,
          });
          updated++;
        }
      }
    }

    return { success: true, updated };
  },
});

// Action: Extract memories from conversation using AI
export const extractMemories = action({
  args: {
    content: v.string(),
    save: v.optional(v.boolean()),
  },
  handler: async () => {
    // Disabled until this is rebuilt through the Mistral router and the
    // accept/edit/reject proposal flow. Public actions must not persist
    // AI-derived memories directly.
    throw new Error('Memory extraction needs review before it can save anything.');
  },
});

// Query: Get memory statistics by sector
export const getMemoryStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', identity.email!))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    const memories = filterLive(await ctx.db
      .query('memories')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect());

    const sectors: MemorySector[] = ['semantic', 'episodic', 'procedural', 'emotional', 'general'];
    const stats = sectors.map((sector) => {
      const sectorMemories = memories.filter((m) => m.sector === sector);
      return {
        sector,
        count: sectorMemories.length,
        avgSalience: sectorMemories.length > 0
          ? sectorMemories.reduce((sum, m) => sum + m.salience, 0) / sectorMemories.length
          : 0,
      };
    });

    return {
      total: memories.length,
      sectors: stats,
      avgSalience: memories.length > 0
        ? memories.reduce((sum, m) => sum + m.salience, 0) / memories.length
        : 0,
    };
  },
});

