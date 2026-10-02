import Resend from "@auth/core/providers/resend";
import { convexAuth } from "@convex-dev/auth/server";
import type { GenericMutationCtx } from "convex/server";
import type { DataModel, Id } from "./_generated/dataModel";
import { isInactiveAccount } from "./lib/accountDeletion";
import {
  buildReturningUserPatch,
  GRANTED_SUBSCRIPTION,
  newUserFields,
  shouldGrantSubscription,
} from "./lib/entitlements";

type AppDb = GenericMutationCtx<DataModel>["db"];

function normalizeEmail(email: string | undefined | null): string {
  return (email ?? "").trim().toLowerCase();
}

/**
 * Find the live (not soft-deleted) user that already owns this email, so a new
 * sign-in method (magic link) links to the existing account instead of
 * creating a duplicate user.
 */
async function findLiveUserIdByEmail(db: AppDb, email: string): Promise<Id<"users"> | null> {
  if (!email) {
    return null;
  }
  // by_email is not unique: skip soft-deleted rows so an older deleted
  // duplicate can't hide the live account.
  const user = await db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .filter((q) => q.eq(q.field("deletedAt"), undefined))
    .first();
  return user ? user._id : null;
}

/**
 * Give the account the subscription row that backs its entitlement tier.
 * Idempotent: a live paid subscription is left exactly as it is.
 */
async function ensureGrantedSubscription(db: AppDb, userId: Id<"users">, now: number) {
  const existing = await db
    .query("subscriptionStates")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();

  if (!shouldGrantSubscription(existing)) {
    return;
  }

  if (existing) {
    await db.patch(existing._id, { ...GRANTED_SUBSCRIPTION, updatedAt: now });
    return;
  }

  await db.insert("subscriptionStates", {
    userId,
    ...GRANTED_SUBSCRIPTION,
    createdAt: now,
    updatedAt: now,
  });
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  // Magic link only (Convex Auth + Auth.js Resend provider).
  // The API key is read from AUTH_RESEND_KEY by Convex Auth.
  providers: [
    Resend({
      from: process.env.RESEND_FROM_EMAIL ?? "Tempo Flow <onboarding@resend.dev>",
      maxAge: 60 * 30,
    }),
  ],
  session: {
    totalDurationMs: 30 * 24 * 60 * 60 * 1000,
  },
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      // Cast ctx.db to the full app DataModel so we can query custom tables
      // (subscriptionStates, users indexes) that are outside the auth-only type.
      const db = ctx.db as unknown as AppDb;
      const now = Date.now();

      const profile = {
        email: normalizeEmail(args.profile.email),
        emailVerified: args.profile.emailVerified ?? false,
        fullName: typeof args.profile.name === "string" ? args.profile.name : "User",
      };

      // Same email already has a user (e.g. an older password account): link
      // this sign-in to that user instead of creating a second one.
      const existingUserId =
        args.existingUserId ?? (await findLiveUserIdByEmail(db, profile.email));

      if (existingUserId) {
        const existing = await db.get(existingUserId);

        // buildReturningUserPatch never returns an undefined value. Assigning
        // undefined here is what stripped entitlementTier, betaAccess,
        // isGodTier and userType on a returning user's SECOND sign-in --
        // Convex reads undefined in a patch as "delete this field".
        //
        // Soft-delete recovery is the one intentional undefined: clearing
        // `deletedAt` brings the row back to live so beforeSessionCreation
        // can issue a session.
        await db.patch(existingUserId, {
          ...buildReturningUserPatch(existing ?? {}, profile, now),
          ...(existing && isInactiveAccount(existing)
            ? { deletedAt: undefined, isActive: true }
            : {}),
        });
        await ensureGrantedSubscription(db, existingUserId, now);

        return existingUserId;
      }

      // Signup is open. No allowlist, no seat cap -- every account is granted
      // the max entitlement tier by newUserFields().
      const userId = await db.insert("users", newUserFields(profile, now));
      await ensureGrantedSubscription(db, userId, now);

      return userId;
    },
    async beforeSessionCreation(ctx, args) {
      const db = ctx.db as unknown as AppDb;
      const user = await db.get(args.userId);
      if (!user) {
        throw new Error("We couldn't load your account yet. Please try again.");
      }
      if (user.deletedAt !== undefined || user.isActive === false) {
        throw new Error("This account is not active. Please contact support.");
      }
    },
  },
});
