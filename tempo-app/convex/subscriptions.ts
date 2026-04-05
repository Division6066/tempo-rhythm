import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "./_helpers";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
  },
});

export const getByRevenuecatUser = query({
  args: { revenuecatAppUserId: v.string() },
  handler: async (ctx, { revenuecatAppUserId }) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_revenuecatAppUserId", (q) =>
        q.eq("revenuecatAppUserId", revenuecatAppUserId)
      )
      .order("desc")
      .first();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const upsertFromWebhook = internalMutation({
  args: {
    userId: v.optional(v.string()),
    revenuecatAppUserId: v.string(),
    tier: v.string(),
    status: v.string(),
    productId: v.optional(v.string()),
    entitlementId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    purchasedAt: v.optional(v.number()),
    environment: v.optional(v.string()),
    store: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_revenuecatAppUserId", (q) =>
        q.eq("revenuecatAppUserId", args.revenuecatAppUserId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        tier: args.tier,
        status: args.status,
        productId: args.productId,
        entitlementId: args.entitlementId,
        expiresAt: args.expiresAt,
        purchasedAt: args.purchasedAt,
        environment: args.environment,
        store: args.store,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("subscriptions", {
      userId: args.userId,
      revenuecatAppUserId: args.revenuecatAppUserId,
      tier: args.tier,
      status: args.status,
      productId: args.productId,
      entitlementId: args.entitlementId,
      expiresAt: args.expiresAt,
      purchasedAt: args.purchasedAt,
      environment: args.environment,
      store: args.store,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const create = mutation({
  args: {
    tier: v.string(),
    status: v.string(),
    productId: v.optional(v.string()),
    entitlementId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    purchasedAt: v.optional(v.number()),
    environment: v.optional(v.string()),
    store: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const now = Date.now();
    return await ctx.db.insert("subscriptions", {
      userId,
      tier: args.tier,
      status: args.status,
      productId: args.productId,
      entitlementId: args.entitlementId,
      expiresAt: args.expiresAt,
      purchasedAt: args.purchasedAt,
      environment: args.environment,
      store: args.store,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("subscriptions"),
    tier: v.optional(v.string()),
    status: v.optional(v.string()),
    productId: v.optional(v.string()),
    entitlementId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});
