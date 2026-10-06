import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";
import { liveOnly, softDeletePatch } from "./lib/soft_delete";

/** Shared resolver for the authenticated app user document. Returns null if unsigned-in. */
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
      if (user && user.deletedAt === undefined) return user;
    } catch {
      // invalid ID, fall through to email lookup
    }
  }

  if (identity.email) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email ?? ""))
      .unique();
    if (user && user.deletedAt === undefined) return user;
  }

  return null;
}

const userDocValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  email: v.string(),
  emailVerificationTime: v.optional(v.number()),
  emailVerified: v.optional(v.boolean()),
  fullName: v.optional(v.string()),
  name: v.optional(v.string()),
  role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
  userType: v.optional(v.union(v.literal("free"), v.literal("paid"))),
  betaAccess: v.optional(v.union(v.literal("none"), v.literal("tester"), v.literal("founder"))),
  entitlementTier: v.optional(
    v.union(
      v.literal("none"),
      v.literal("basic"),
      v.literal("pro"),
      v.literal("max"),
      v.literal("god"),
    ),
  ),
  isGodTier: v.optional(v.boolean()),
  betaApprovedAt: v.optional(v.number()),
  isActive: v.optional(v.boolean()),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
});

export const getCurrentUser = query({
  args: {},
  returns: v.union(userDocValidator, v.null()),
  handler: async (ctx) => fetchCurrentUser(ctx),
});

/** Profile for dashboard greeting and header; extends user with `greetingName`. */
export const getProfile = query({
  args: {},
  returns: v.union(v.any(), v.null()),
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

/**
 * Fetch a user by id. Auth required.
 * Non-admins may only read their own row.
 */
export const getById = query({
  args: { userId: v.id("users") },
  returns: v.union(userDocValidator, v.null()),
  handler: async (ctx, { userId }) => {
    const self = await requireUser(ctx);
    const user = await ctx.db.get(userId);
    if (!user || user.deletedAt !== undefined) {
      return null;
    }
    if (self.role !== "admin" && self._id !== userId) {
      throw new Error("Unauthorized");
    }
    return user;
  },
});

/**
 * List active (non-deleted, isActive) users. Admin-only.
 */
export const listActive = query({
  args: {},
  returns: v.array(userDocValidator),
  handler: async (ctx) => {
    const self = await requireUser(ctx);
    if (self.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    // Prefer role/index-friendly reads; filter soft-deleted + isActive in memory
    // (isActive is not a dedicated index — small admin-only set).
    const all = await ctx.db.query("users").collect();
    return liveOnly(all).filter((u) => u.isActive === true);
  },
});

/**
 * Upsert the signed-in identity onto the users table.
 * Prefer auth `createOrUpdateUser` callback for first insert; this patches
 * by email when a row already exists to avoid duplicate founder/email rows.
 */
export const createOrUpdateUser = mutation({
  args: {},
  returns: v.id("users"),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const email = (identity.email ?? "").trim().toLowerCase();
    if (!email) throw new Error("Authenticated identity is missing an email");

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
      deletedAt: undefined,
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
    fullName: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, { fullName }) => {
    const user = await requireUser(ctx);
    await ctx.db.patch(user._id, {
      fullName,
      updatedAt: Date.now(),
    });
    return user._id;
  },
});

export const updateUserType = mutation({
  args: {
    userType: v.union(v.literal("free"), v.literal("paid")),
  },
  returns: v.id("users"),
  handler: async (ctx, { userType }) => {
    const user = await requireUser(ctx);
    await ctx.db.patch(user._id, { userType, updatedAt: Date.now() });
    return user._id;
  },
});

/**
 * Called by the RevenueCat webhook (convex/revenuecat.ts) to sync subscription status.
 * INTERNAL ONLY — never expose as a public mutation (auth gate / spoofing risk).
 */
export const updateSubscriptionStatus = internalMutation({
  args: {
    userId: v.string(),
    userType: v.union(v.literal("free"), v.literal("paid")),
    activeEntitlements: v.array(v.string()),
    revenueCatEvent: v.string(),
  },
  returns: v.object({
    updated: v.boolean(),
    userId: v.optional(v.id("users")),
  }),
  handler: async (ctx, { userId, userType, activeEntitlements: _entitlements, revenueCatEvent: _event }) => {
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", userId))
      .unique();

    if (!user) {
      try {
        user = await ctx.db.get(userId as import("./_generated/dataModel").Id<"users">);
      } catch {
        // Not a valid Convex ID — user not found
      }
    }

    if (!user || user.deletedAt !== undefined) {
      console.warn(`[RevenueCat] User not found for appUserId: ${userId}`);
      return { updated: false };
    }

    await ctx.db.patch(user._id, { userType, updatedAt: Date.now() });
    return { updated: true, userId: user._id };
  },
});

/**
 * Soft-delete a user. Self or admin only.
 */
export const remove = mutation({
  args: { userId: v.id("users") },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, { userId }) => {
    const self = await requireUser(ctx);
    if (self.role !== "admin" && self._id !== userId) {
      throw new Error("Unauthorized");
    }
    const target = await ctx.db.get(userId);
    if (!target || target.deletedAt !== undefined) {
      throw new Error("User not found");
    }
    await ctx.db.patch(userId, softDeletePatch());
    return { success: true };
  },
});

export const deleteMyAccount = mutation({
  args: {},
  returns: v.object({ success: v.boolean(), deletedCount: v.number() }),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    await ctx.db.patch(user._id, {
      ...softDeletePatch(),
      isActive: false,
    });
    return { success: true, deletedCount: 1 };
  },
});
