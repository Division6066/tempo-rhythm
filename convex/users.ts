import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";
import { softDeleteUserData } from "./lib/soft_delete_user_data";

/** Server-only dev flag; client MOCK_PAYMENTS must not bypass entitlements alone. */
function mockEntitlementsAllowed(): boolean {
  return process.env.ALLOW_MOCK_ENTITLEMENTS === "true";
}

async function requireAdmin(ctx: QueryCtx): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return user;
}

/** Shared resolver for the authenticated app user document. */
export async function fetchCurrentUser(ctx: QueryCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  // In Convex Auth the subject is: authAccountId|userId
  const subjectParts = identity.subject.split("|");
  if (subjectParts.length >= 2) {
    const userId = subjectParts[1] as Id<"users">;
    try {
      const user = await ctx.db.get(userId);
      if (user) return user;
    } catch {
      // invalid ID, fall through to email lookup
    }
  }

  if (identity.email) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email ?? ""))
      .unique();
    if (user) return user;
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
    const currentUser = await requireUser(ctx);
    if (currentUser.role !== "admin" && currentUser._id !== userId) {
      throw new Error("Forbidden");
    }
    return ctx.db.get(userId);
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
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
    const currentUser = await requireUser(ctx);
    if (currentUser._id !== userId) {
      throw new Error("Forbidden");
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
    if (!mockEntitlementsAllowed()) {
      throw new Error("Entitlement changes require RevenueCat verification");
    }

    const user = await requireUser(ctx);
    await ctx.db.patch(user._id, { userType, updatedAt: Date.now() });
    return user._id;
  },
});

/**
 * Called by the RevenueCat webhook (convex/revenuecat.ts) to sync subscription status.
 * Internal-only — never expose to clients.
 */
export const updateSubscriptionStatus = internalMutation({
  args: {
    userId: v.string(),
    userType: v.union(v.literal("free"), v.literal("paid")),
    activeEntitlements: v.array(v.string()),
    revenueCatEvent: v.string(),
  },
  handler: async (ctx, { userId, userType, activeEntitlements: _entitlements, revenueCatEvent: _event }) => {
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", userId))
      .unique();

    if (!user) {
      try {
        user = await ctx.db.get(userId as Id<"users">);
      } catch {
        // Not a valid Convex ID — user not found
      }
    }

    if (!user) {
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
    const currentUser = await requireUser(ctx);
    if (currentUser._id !== userId) {
      throw new Error("Forbidden");
    }
    const now = Date.now();
    const deletedCount = await softDeleteUserData(ctx, userId, now);
    return { success: true, deletedCount };
  },
});

export const deleteMyAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    const deletedCount = await softDeleteUserData(ctx, user._id, now);
    return { success: true, deletedCount };
  },
});
