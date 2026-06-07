import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { userIdFromAuthSubject } from "./lib/authSubject";

/** Shared resolver for the authenticated app user document. */
export async function fetchCurrentUser(ctx: QueryCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const subjectUserId = userIdFromAuthSubject(identity.subject);
  if (subjectUserId) {
    try {
      const user = await ctx.db.get(subjectUserId as Id<"users">);
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
  handler: async (ctx, { userId }) => ctx.db.get(userId),
});

export const listActive = query({
  args: {},
  handler: async (ctx) =>
    ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect(),
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
    const user = await fetchCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    if (user._id !== userId) {
      throw new Error("Not authorized");
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    let user = null;
    const subjectParts = identity.subject.split("|");
    if (subjectParts.length >= 2) {
      const userId = subjectParts[1] as import("./_generated/dataModel").Id<"users">;
      try {
        user = await ctx.db.get(userId);
      } catch {
        // fall through
      }
    }

    if (!user && identity.email) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email ?? ""))
        .unique();
    }

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, { userType, updatedAt: Date.now() });
    return user._id;
  },
});

/**
 * Called by the RevenueCat webhook (convex/revenuecat.ts) to sync subscription status.
 * Uses appUserId (RevenueCat user ID = Convex user email or subject) to find and update the user.
 */
export const updateSubscriptionStatus = mutation({
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.delete(userId);
  },
});

async function softDeleteUserOwnedData(
  ctx: MutationCtx,
  userId: Id<"users">,
  now: number,
): Promise<number> {
  let deletedCount = 0;

  const userOwnedTables = ["tasks", "notes", "habits", "goals", "memories"] as const;
  for (const table of userOwnedTables) {
    const rows = await ctx.db
      .query(table)
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const row of rows) {
      if (row.deletedAt !== undefined) continue;
      await ctx.db.patch(row._id, { deletedAt: now, updatedAt: now });
      deletedCount += 1;
    }
  }

  const conversations = await ctx.db
    .query("conversations")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const conversation of conversations) {
    if (conversation.deletedAt === undefined) {
      await ctx.db.patch(conversation._id, { deletedAt: now, updatedAt: now });
      deletedCount += 1;
    }
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
      .collect();
    for (const message of messages) {
      if (message.deletedAt !== undefined) continue;
      await ctx.db.patch(message._id, { deletedAt: now });
      deletedCount += 1;
    }
  }

  return deletedCount;
}

export const deleteMyAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await fetchCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    if (user.deletedAt !== undefined) {
      return { success: true, deletedCount: 0 };
    }

    const now = Date.now();
    let deletedCount = await softDeleteUserOwnedData(ctx, user._id, now);

    await ctx.db.patch(user._id, {
      deletedAt: now,
      isActive: false,
      updatedAt: now,
    });
    deletedCount += 1;

    const subscription = await ctx.db
      .query("subscriptionStates")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (subscription) {
      await ctx.db.patch(subscription._id, {
        status: "cancelled",
        updatedAt: now,
      });
    }

    return { success: true, deletedCount };
  },
});
