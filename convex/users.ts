import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { isActiveUser, requireUser } from "./lib/requireUser";

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
      if (user && isActiveUser(user)) return user;
    } catch {
      // invalid ID, fall through to email lookup
    }
  }

  if (identity.email) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email ?? ""))
      .unique();
    if (user && isActiveUser(user)) return user;
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

export const getById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => ctx.db.get(userId),
});

export const listActive = internalQuery({
  args: {},
  handler: async (ctx) =>
    ctx.db
      .query("users")
      .withIndex("by_deletedAt", (q) => q.eq("deletedAt", undefined))
      .collect()
      .then((users) => users.filter((user) => user.isActive === true)),
});

async function softDeleteConversationMessages(
  ctx: MutationCtx,
  conversationId: Id<"conversations">,
  now: number,
) {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_conversationId_deletedAt", (q) =>
      q.eq("conversationId", conversationId).eq("deletedAt", undefined),
    )
    .collect();

  for (const message of messages) {
    await ctx.db.patch(message._id, { deletedAt: now });
  }
  return messages.length;
}

async function softDeleteUserOwnedRows(ctx: MutationCtx, userId: Id<"users">, now: number) {
  let deletedCount = 0;

  const conversations = await ctx.db
    .query("conversations")
    .withIndex("by_userId_deletedAt", (q) =>
      q.eq("userId", userId).eq("deletedAt", undefined),
    )
    .collect();
  for (const conversation of conversations) {
    deletedCount += await softDeleteConversationMessages(ctx, conversation._id, now);
    await ctx.db.patch(conversation._id, { deletedAt: now, updatedAt: now });
    deletedCount += 1;
  }

  const memories = await ctx.db
    .query("memories")
    .withIndex("by_userId_deletedAt", (q) =>
      q.eq("userId", userId).eq("deletedAt", undefined),
    )
    .collect();
  for (const memory of memories) {
    await ctx.db.patch(memory._id, { deletedAt: now, updatedAt: now });
    deletedCount += 1;
  }

  const tasks = await ctx.db
    .query("tasks")
    .withIndex("by_userId_deletedAt", (q) =>
      q.eq("userId", userId).eq("deletedAt", undefined),
    )
    .collect();
  for (const task of tasks) {
    await ctx.db.patch(task._id, { deletedAt: now, updatedAt: now });
    deletedCount += 1;
  }

  const notes = await ctx.db
    .query("notes")
    .withIndex("by_userId_deletedAt", (q) =>
      q.eq("userId", userId).eq("deletedAt", undefined),
    )
    .collect();
  for (const note of notes) {
    await ctx.db.patch(note._id, { deletedAt: now, updatedAt: now });
    deletedCount += 1;
  }

  const habits = await ctx.db
    .query("habits")
    .withIndex("by_userId_deletedAt", (q) =>
      q.eq("userId", userId).eq("deletedAt", undefined),
    )
    .collect();
  for (const habit of habits) {
    await ctx.db.patch(habit._id, { deletedAt: now, updatedAt: now });
    deletedCount += 1;
  }

  const goals = await ctx.db
    .query("goals")
    .withIndex("by_userId_deletedAt", (q) =>
      q.eq("userId", userId).eq("deletedAt", undefined),
    )
    .collect();
  for (const goal of goals) {
    await ctx.db.patch(goal._id, { deletedAt: now, updatedAt: now });
    deletedCount += 1;
  }

  const subscriptionState = await ctx.db
    .query("subscriptionStates")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
  if (subscriptionState) {
    await ctx.db.patch(subscriptionState._id, {
      status: "cancelled",
      source: "account_deleted",
      updatedAt: now,
    });
  }

  return deletedCount;
}

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.optional(v.string()),
  },
  handler: async (ctx, { userId, fullName }) => {
    const currentUser = await requireUser(ctx);
    if (currentUser._id !== userId && currentUser.role !== "admin") {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(userId, { fullName, updatedAt: Date.now() });
    return userId;
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

    if (!user) {
      console.warn(`[RevenueCat] User not found for appUserId: ${userId}`);
      return { updated: false };
    }

    await ctx.db.patch(user._id, { userType, updatedAt: Date.now() });
    return { updated: true, userId: user._id };
  },
});

export const deleteMyAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    const deletedRows = await softDeleteUserOwnedRows(ctx, user._id, now);

    await ctx.db.patch(user._id, {
      isActive: false,
      deletedAt: now,
      updatedAt: now,
    });

    return { success: true, deletedCount: deletedRows + 1 };
  },
});
