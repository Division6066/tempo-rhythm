import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { requireUser } from "./requireUser";

export const providerValidator = v.union(v.literal("mistral"));
export type ProviderId = "mistral";

export const providerKeyReturnValidator = v.union(
  v.object({
    provider: providerValidator,
    apiKey: v.string(),
    updatedAt: v.number(),
  }),
  v.null(),
);

export function normalizeProviderKeyInput(apiKey: string): string {
  const trimmed = apiKey.trim();
  if (trimmed.length < 8) {
    throw new Error("Provider key should be at least 8 characters.");
  }
  return trimmed;
}

export async function getProviderKeyForUser(
  ctx: QueryCtx,
  provider: ProviderId,
): Promise<{ provider: ProviderId; apiKey: string; updatedAt: number } | null> {
  const user = await requireUser(ctx);
  const key = await ctx.db
    .query("providerKeys")
    .withIndex("by_userId_provider", (q) => q.eq("userId", user._id).eq("provider", provider))
    .unique();

  if (!key || key.deletedAt !== undefined) {
    return null;
  }

  return {
    provider: key.provider,
    apiKey: key.apiKey,
    updatedAt: key.updatedAt,
  };
}

export async function saveProviderKeyForUser(
  ctx: MutationCtx,
  args: { provider: ProviderId; apiKey: string },
): Promise<{ provider: ProviderId; apiKey: string; updatedAt: number }> {
  const user = await requireUser(ctx);
  const apiKey = normalizeProviderKeyInput(args.apiKey);
  const now = Date.now();

  const existing = await ctx.db
    .query("providerKeys")
    .withIndex("by_userId_provider", (q) =>
      q.eq("userId", user._id).eq("provider", args.provider),
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
}
