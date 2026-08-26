import type { Doc } from "../_generated/dataModel";

/**
 * Single source of truth for what an account is granted at sign-up.
 *
 * Signup is open: every account gets the top entitlement tier. These helpers are
 * deliberately PURE (no `ctx`, no `db`) so both write paths -- the Convex Auth
 * `createOrUpdateUser` callback in `convex/auth.ts` and the `createOrUpdateUser`
 * mutation in `convex/users.ts` -- share them and cannot drift apart again, and
 * so the regression test can call them directly.
 */

export type EntitlementTier = NonNullable<Doc<"users">["entitlementTier"]>;
export type UserType = NonNullable<Doc<"users">["userType"]>;
export type BetaAccess = NonNullable<Doc<"users">["betaAccess"]>;

export const GRANTED_ENTITLEMENT_TIER = "max" satisfies EntitlementTier;
export const GRANTED_USER_TYPE = "paid" satisfies UserType;
export const GRANTED_BETA_ACCESS = "tester" satisfies BetaAccess;

/**
 * The subscription row that backs the grant. `entitlementTier` alone unlocks
 * nothing -- `PremiumGate` reads `userType` and billing reads `subscriptionStates`.
 */
export const GRANTED_SUBSCRIPTION = {
  plan: "max",
  billingCycle: "lifetime",
  status: "active",
  trialUsed: true,
  source: "open_signup_grant",
} as const;

/** The identity fields both write paths receive from the auth provider. */
export type SignInProfile = {
  email: string;
  emailVerified?: boolean;
  fullName?: string;
};

/** Only the entitlement fields the returning-user rules need to look at. */
export type ReturningUserSnapshot = {
  entitlementTier?: EntitlementTier;
  userType?: UserType;
  betaAccess?: BetaAccess;
};

export type ReturningUserPatch = {
  email: string;
  emailVerified: boolean;
  fullName: string;
  updatedAt: number;
  entitlementTier?: EntitlementTier;
  userType?: UserType;
  betaAccess?: BetaAccess;
};

/** Field set for a brand-new account. Signup is open, so everyone gets `max`. */
export function newUserFields(profile: SignInProfile, now: number) {
  return {
    email: profile.email,
    emailVerified: profile.emailVerified ?? false,
    fullName: profile.fullName ?? "User",
    role: "user" as const,
    userType: GRANTED_USER_TYPE,
    betaAccess: GRANTED_BETA_ACCESS,
    entitlementTier: GRANTED_ENTITLEMENT_TIER,
    betaApprovedAt: now,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Build the patch applied to a user who is signing in again.
 *
 * !! THE INVARIANT THIS FILE EXISTS FOR: this function must never return a key
 * whose value is `undefined`. Convex `db.patch` treats an `undefined` value as
 * "delete this field", so `{ entitlementTier: undefined }` silently strips a
 * paid account on its SECOND sign-in -- the first one looks perfect. Keys are
 * added conditionally, never assigned a possibly-undefined value.
 *
 * It also self-heals accounts already damaged by that bug, and normalizes the
 * retired `"god"` tier down to `"max"`. A real, already-granted value is left
 * alone so a RevenueCat/Polar downgrade is not stomped back to `paid` on
 * every sign-in.
 */
export function buildReturningUserPatch(
  existing: ReturningUserSnapshot,
  profile: SignInProfile,
  now: number,
): ReturningUserPatch {
  const patch: ReturningUserPatch = {
    email: profile.email,
    emailVerified: profile.emailVerified ?? false,
    fullName: profile.fullName ?? "User",
    updatedAt: now,
  };

  // Missing (stripped by the patch-undefined bug), never granted, or on the
  // retired "god" tier -> bring it up to the granted tier.
  const tier = existing.entitlementTier;
  if (tier === undefined || tier === "none" || tier === "god") {
    patch.entitlementTier = GRANTED_ENTITLEMENT_TIER;
  }

  // Only fill a MISSING value. An explicit "free" is a real downgrade decision
  // made by the billing webhook and must survive sign-in.
  if (existing.userType === undefined) {
    patch.userType = GRANTED_USER_TYPE;
  }

  if (existing.betaAccess === undefined) {
    patch.betaAccess = GRANTED_BETA_ACCESS;
  }

  return patch;
}

/**
 * True when the account should be given the granted subscription row: it has
 * none at all, or it still carries the pre-open-signup placeholder.
 */
export function shouldGrantSubscription(
  existing?: { plan: string; status: string } | null,
): boolean {
  if (!existing) return true;
  return existing.plan === "none" || existing.status === "inactive";
}
