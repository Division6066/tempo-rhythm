import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const findUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const account = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", "password").eq("providerAccountId", email)
      )
      .unique();
    if (!account) return null;
    return account.userId;
  },
});

export const ensurePaidProfile = internalMutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        userType: "paid",
        role: "user",
        isActive: true,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("profiles", {
      userId,
      role: "user",
      userType: "paid",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createBetaUser = internalMutation({
  args: {
    email: v.string(),
    hashedPassword: v.string(),
    name: v.string(),
  },
  handler: async (ctx, { email, hashedPassword, name }) => {
    const userId = await ctx.db.insert("users", {
      email,
      name,
    });
    await ctx.db.insert("authAccounts", {
      userId,
      provider: "password",
      providerAccountId: email,
      secret: hashedPassword,
    });
    const now = Date.now();
    await ctx.db.insert("profiles", {
      userId: userId as string,
      fullName: name,
      role: "user",
      userType: "paid",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    return userId;
  },
});
