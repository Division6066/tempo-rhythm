import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
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

export const remove = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.delete(userId);
  },
});

export const deleteMyAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    let deletedCount = 0;

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), userId))
      .first();

    if (user) {
      await ctx.db.delete(user._id);
      deletedCount += 1;
    }

    return { success: true, deletedCount };
  },
});
