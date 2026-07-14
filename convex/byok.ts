import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

const providerValidator = v.union(v.literal("mistral"));

const providerKeyReturnValidator = v.union(
  v.object({
    provider: providerValidator,
    apiKey: v.string(),
    updatedAt: v.number(),
  }),
  v.null(),
);

function normalizeApiKey(apiKey: string): string {
  const trimmed = apiKey.trim();
  if (trimmed.length < 8) {
    throw new Error("Provider key should be at least 8 characters.");
  }
  return trimmed;
}

export const getProviderKey = query({
  args: {
    provider: providerValidator,
  },
  returns: providerKeyReturnValidator,
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const key = await ctx.db
      .query("providerKeys")
      .withIndex("by_userId_provider", (q) =>
        q.eq("userId", user._id).eq("provider", args.provider)
      )
      .unique();

    if (!key || key.deletedAt !== undefined) {
      return null;
    }

    return {
      provider: key.provider,
      apiKey: key.apiKey,
      updatedAt: key.updatedAt,
    };
  },
});

export const saveProviderKey = mutation({
  args: {
    provider: providerValidator,
    apiKey: v.string(),
  },
  returns: providerKeyReturnValidator,
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const apiKey = normalizeApiKey(args.apiKey);
    const now = Date.now();

    const existing = await ctx.db
      .query("providerKeys")
      .withIndex("by_userId_provider", (q) =>
        q.eq("userId", user._id).eq("provider", args.provider)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        apiKey,
        deletedAt: undefined,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("providerKeys", {
        userId: user._id,
        provider: args.provider,
        apiKey,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      provider: args.provider,
      apiKey,
      updatedAt: now,
    };
  },
});
