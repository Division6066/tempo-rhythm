import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { internalMutation, mutation, query } from "./_generated/server";
import { findUserByIdentity, requireUser } from "./lib/requireUser";

/** Shared resolver for the authenticated app user document. */
export async function fetchCurrentUser(ctx: QueryCtx): Promise<Doc<"users"> | null> {
  return await findUserByIdentity(ctx);
}

export function isMockPaymentMutationAllowed(
  value = process.env.ALLOW_MOCK_PAYMENT_MUTATIONS,
) {
  return value === "true";
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
    const user = await requireUser(ctx);
    if (user._id !== userId && user.role !== "admin") {
      throw new Error("User not found");
    }
    return await ctx.db.get(userId);
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return await ctx.db
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
    const user = await requireUser(ctx);
    if (user._id !== userId) {
      throw new Error("User not found");
    }
    const patch: { fullName?: string; updatedAt: number } = { updatedAt: Date.now() };
    if (fullName !== undefined) {
      patch.fullName = fullName;
    }
    await ctx.db.patch(userId, patch);
    return userId;
  },
});

export const updateUserType = mutation({
  args: {
    userType: v.union(v.literal("free"), v.literal("paid")),
  },
  handler: async (ctx, { userType }) => {
    if (!isMockPaymentMutationAllowed()) {
      throw new Error("Mock payment updates are disabled.");
    }

    const user = await requireUser(ctx);

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
    const user = await requireUser(ctx);
    if (user._id !== userId) {
      throw new Error("User not found");
    }
    await softDeleteUserData(ctx, user);
  },
});

export const deleteMyAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const deletedCount = await softDeleteUserData(ctx, user);

    return { success: true, deletedCount };
  },
});

async function softDeleteUserData(ctx: MutationCtx, user: Doc<"users">) {
  const now = Date.now();
  let deletedCount = 0;

  if (user.deletedAt === undefined || user.isActive !== false) {
    await ctx.db.patch(user._id, { deletedAt: now, isActive: false, updatedAt: now });
    deletedCount += 1;
  }

  const subscriptionStates = await ctx.db
    .query("subscriptionStates")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
    .collect();
  for (const subscriptionState of subscriptionStates) {
    if (subscriptionState.deletedAt === undefined) {
      await ctx.db.patch(subscriptionState._id, {
        plan: "none",
        billingCycle: "none",
        status: "cancelled",
        deletedAt: now,
        updatedAt: now,
      });
      deletedCount += 1;
    }
  }

  const conversations = await ctx.db
    .query("conversations")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
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
      if (message.deletedAt === undefined) {
        await ctx.db.patch(message._id, { deletedAt: now });
        deletedCount += 1;
      }
    }
  }

  const memories = await ctx.db
    .query("memories")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
    .collect();
  for (const memory of memories) {
    if (memory.deletedAt === undefined) {
      await ctx.db.patch(memory._id, { deletedAt: now, updatedAt: now });
      deletedCount += 1;
    }
  }

  const tasks = await ctx.db
    .query("tasks")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
    .collect();
  for (const task of tasks) {
    if (task.deletedAt === undefined) {
      await ctx.db.patch(task._id, { deletedAt: now, updatedAt: now });
      deletedCount += 1;
    }
  }

  const notes = await ctx.db
    .query("notes")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
    .collect();
  for (const note of notes) {
    if (note.deletedAt === undefined) {
      await ctx.db.patch(note._id, { deletedAt: now, updatedAt: now });
      deletedCount += 1;
    }
  }

  const habits = await ctx.db
    .query("habits")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
    .collect();
  for (const habit of habits) {
    if (habit.deletedAt === undefined) {
      await ctx.db.patch(habit._id, { deletedAt: now, updatedAt: now });
      deletedCount += 1;
    }
  }

  const goals = await ctx.db
    .query("goals")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
    .collect();
  for (const goal of goals) {
    if (goal.deletedAt === undefined) {
      await ctx.db.patch(goal._id, { deletedAt: now, updatedAt: now });
      deletedCount += 1;
    }
  }

  return deletedCount;
}
