import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";
import { filterLive, isLive, softDeleteWithUpdatedAt } from "./lib/softDelete";

/** Shared resolver for the authenticated app user document. */
export async function fetchCurrentUser(ctx: QueryCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  // In Convex Auth the subject is: authAccountId|userId
  const subjectParts = identity.subject.split("|");
  if (subjectParts.length >= 2) {
    const userId = subjectParts[1] as import("./_generated/dataModel").Id<"users">;
    try {
      const user = await ctx.db.get(userId);
      if (isLive(user) && user.isActive !== false) return user;
    } catch {
      // invalid ID, fall through to email lookup
    }
  }

  if (identity.email) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email ?? ""))
      .unique();
    if (isLive(user) && user.isActive !== false) return user;
  }

  return null;
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => fetchCurrentUser(ctx),
});

/** Profile for dashboard greeting and header; extends user with `greetingName`. */
export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await fetchCurrentUser(ctx);
    if (!user) return null;
    const greetingName =
      user.fullName?.trim() || user.email?.split("@")[0] || "there";
    return {
      ...user,
      greetingName,
    };
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const actor = await requireUser(ctx);
    if (actor._id !== userId && actor.role !== "admin") {
      return null;
    }
    const user = await ctx.db.get(userId);
    return isLive(user) ? user : null;
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const actor = await requireUser(ctx);
    if (actor.role !== "admin") {
      return [];
    }
    return filterLive(await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect());
  },
});

export const createOrUpdateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const email = identity.email ?? "";
    const now = Date.now();

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    const userData = {
      email,
      emailVerified: identity.emailVerified ?? false,
      fullName: identity.name || identity.nickname || "User",
      role: "user" as const,
      userType: "free" as const,
      isActive: true,
      updatedAt: now,
    };

    if (existing) {
      if (!isLive(existing) || existing.isActive === false) {
        throw new Error("This account is not active. Please contact support.");
      }
      await ctx.db.patch(existing._id, userData);
      return existing._id;
    }

    return ctx.db.insert("users", { ...userData, createdAt: now });
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.optional(v.string()),
  },
  handler: async (ctx, { userId, fullName }) => {
    const actor = await requireUser(ctx);
    if (actor._id !== userId && actor.role !== "admin") {
      throw new Error("User not found");
    }
    const target = await ctx.db.get(userId);
    if (!isLive(target)) {
      throw new Error("User not found");
    }
    await ctx.db.patch(userId, { fullName, updatedAt: Date.now() });
    return userId;
  },
});

export const updateUserType = mutation({
  args: {
    userType: v.union(v.literal("free"), v.literal("paid")),
  },
  handler: async (ctx, { userType }) => {
    const user = await requireUser(ctx);
    if (!isLive(user)) throw new Error("User not found");

    const mockEntitlementEnabled = process.env.ALLOW_MOCK_ENTITLEMENT_MUTATIONS === "true";
    if (user.role !== "admin" && !mockEntitlementEnabled) {
      throw new Error("Entitlement changes must come from billing sync.");
    }

    await ctx.db.patch(user._id, { userType, updatedAt: Date.now() });
    return user._id;
  },
});

/**
 * Called by the RevenueCat webhook (convex/revenuecat.ts) to sync subscription status.
 * Uses appUserId (RevenueCat user ID = Convex user email or subject) to find and update the user.
 */
export const updateSubscriptionStatus = internalMutation({
  args: {
    userId: v.string(),
    userType: v.union(v.literal("free"), v.literal("paid")),
    activeEntitlements: v.array(v.string()),
    revenueCatEvent: v.string(),
  },
  handler: async (ctx, { userId, userType, activeEntitlements: _entitlements, revenueCatEvent: _event }) => {
    // Try to find user by email (RevenueCat appUserId is typically the user's email)
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", userId))
      .unique();

    // Fallback: try to find by ID if userId looks like a Convex ID
    if (!user) {
      try {
        user = await ctx.db.get(userId as import("./_generated/dataModel").Id<"users">);
      } catch {
        // Not a valid Convex ID — user not found
      }
    }

    if (!isLive(user)) {
      console.warn(`[RevenueCat] User not found for appUserId: ${userId}`);
      return { updated: false };
    }

    await ctx.db.patch(user._id, { userType, updatedAt: Date.now() });
    return { updated: true, userId: user._id };
  },
});

export const remove = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const actor = await requireUser(ctx);
    if (actor._id !== userId && actor.role !== "admin") {
      throw new Error("User not found");
    }
    const target = await ctx.db.get(userId);
    if (!isLive(target)) {
      throw new Error("User not found");
    }
    await ctx.db.patch(userId, {
      ...softDeleteWithUpdatedAt(),
      isActive: false,
    });
    return { success: true };
  },
});

export const deleteMyAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    await ctx.db.patch(user._id, {
      ...softDeleteWithUpdatedAt(),
      isActive: false,
    });

    return { success: true, deletedCount: 1 };
  },
});
