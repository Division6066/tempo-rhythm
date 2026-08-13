/**
 * BYOK — bring-your-own-key storage for AI providers.
 *
 * Flow: the user pastes a key → `setKey` action validates it against the
 * provider's cheapest documented endpoint → the key is encrypted
 * (AES-256-GCM, per-user HKDF key from BYOK_MASTER_KEY) → only ciphertext
 * persists. Queries expose presence, never plaintext.
 *
 * SECURITY INVARIANTS:
 * - Plaintext keys never persist to the database and never appear in logs,
 *   error messages, or query results.
 * - Decryption happens only inside actions that immediately use the key for
 *   a provider call (see convex/voice.ts).
 */

import {
  getProvider,
  ProviderAuthError,
  requireEnv,
  type ProviderId,
} from "@tempo/ai";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
  type ActionCtx,
} from "./_generated/server";
import { byokRefs } from "./lib/fn_refs";
import { decryptSecret, encryptSecret } from "./lib/byok_crypto";
import { requireUser } from "./lib/requireUser";

const providerValidator = v.union(v.literal("deepgram"), v.literal("mistral"));

/** Presence-only view of the caller's stored keys. Never returns ciphertext. */
export const myKeys = query({
  args: {},
  returns: v.array(
    v.object({
      provider: providerValidator,
      createdAt: v.number(),
      updatedAt: v.number(),
      lastValidatedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const rows = await ctx.db
      .query("byokKeys")
      .withIndex("by_userId_deletedAt", (q) =>
        q.eq("userId", user._id).eq("deletedAt", undefined),
      )
      .collect();
    return rows.map((row) => ({
      provider: row.provider,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lastValidatedAt: row.lastValidatedAt,
    }));
  },
});

/** Internal: resolve the calling user's id (auth propagates into runQuery). */
export const meForAction = internalQuery({
  args: {},
  returns: v.id("users"),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    return user._id;
  },
});

/**
 * Validate a pasted provider key, then store it encrypted. The plaintext key
 * exists only inside this action invocation.
 */
export const setKey = action({
  args: {
    provider: providerValidator,
    apiKey: v.string(),
  },
  returns: v.object({ provider: providerValidator, validated: v.boolean() }),
  handler: async (ctx, args) => {
    const userId: Id<"users"> = await ctx.runQuery(byokRefs.meForAction, {});

    const apiKey = args.apiKey.trim();
    if (apiKey === "") {
      throw new Error("Paste a key first — the field looks empty.");
    }

    // Validate the instant the user pastes it (cheapest documented endpoint
    // per provider; see packages/ai/src/byok-providers/*).
    try {
      await getProvider(args.provider).validateKey(apiKey);
    } catch (err) {
      if (err instanceof ProviderAuthError) {
        throw new Error(
          `${args.provider} did not accept that key. Double-check it in the ${args.provider} dashboard and paste it again.`,
        );
      }
      throw new Error(
        `Could not reach ${args.provider} to check the key right now. Your key was not saved — try again in a moment.`,
      );
    }

    const masterKey = requireEnv("BYOK_MASTER_KEY", { deployment: "convex" });
    const encrypted = await encryptSecret(masterKey, userId, apiKey);

    await ctx.runMutation(byokRefs.storeEncryptedKey, {
      userId,
      provider: args.provider,
      ciphertextB64: encrypted.ciphertextB64,
      ivB64: encrypted.ivB64,
      keyVersion: encrypted.keyVersion,
    });

    return { provider: args.provider, validated: true };
  },
});

/** Internal: upsert the encrypted key row for (user, provider). */
export const storeEncryptedKey = internalMutation({
  args: {
    userId: v.id("users"),
    provider: providerValidator,
    ciphertextB64: v.string(),
    ivB64: v.string(),
    keyVersion: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("byokKeys")
      .withIndex("by_userId_provider", (q) =>
        q.eq("userId", args.userId).eq("provider", args.provider),
      )
      .collect();
    const live = existing.find((row) => row.deletedAt === undefined);
    if (live) {
      await ctx.db.patch(live._id, {
        ciphertextB64: args.ciphertextB64,
        ivB64: args.ivB64,
        keyVersion: args.keyVersion,
        lastValidatedAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("byokKeys", {
        userId: args.userId,
        provider: args.provider,
        ciphertextB64: args.ciphertextB64,
        ivB64: args.ivB64,
        keyVersion: args.keyVersion,
        lastValidatedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }
    return null;
  },
});

/** Soft-delete the caller's stored key for one provider. */
export const deleteKey = mutation({
  args: { provider: providerValidator },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const rows = await ctx.db
      .query("byokKeys")
      .withIndex("by_userId_provider", (q) =>
        q.eq("userId", user._id).eq("provider", args.provider),
      )
      .collect();
    const live = rows.find((row) => row.deletedAt === undefined);
    if (!live) return false;
    const now = Date.now();
    await ctx.db.patch(live._id, { deletedAt: now, updatedAt: now });
    return true;
  },
});

/** Internal: fetch the encrypted row for decryption inside an action. */
export const getEncryptedKeyRow = internalQuery({
  args: {
    userId: v.id("users"),
    provider: providerValidator,
  },
  returns: v.union(
    v.object({ ciphertextB64: v.string(), ivB64: v.string() }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("byokKeys")
      .withIndex("by_userId_provider", (q) =>
        q.eq("userId", args.userId).eq("provider", args.provider),
      )
      .collect();
    const live = rows.find((row) => row.deletedAt === undefined);
    if (!live) return null;
    return { ciphertextB64: live.ciphertextB64, ivB64: live.ivB64 };
  },
});

/**
 * Plain helper for other actions: decrypt the user's key for one provider,
 * or null when none is stored. The plaintext must be used immediately for a
 * provider call and never logged or persisted.
 */
export async function getDecryptedByokKey(
  ctx: ActionCtx,
  userId: Id<"users">,
  provider: ProviderId,
): Promise<string | null> {
  const row = await ctx.runQuery(byokRefs.getEncryptedKeyRow, {
    userId,
    provider,
  });
  if (!row) return null;
  const masterKey = requireEnv("BYOK_MASTER_KEY", { deployment: "convex" });
  return decryptSecret(masterKey, userId, row);
}
