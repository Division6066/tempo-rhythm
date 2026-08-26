import { Email } from "@convex-dev/auth/providers/Email";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import type { GenericMutationCtx } from "convex/server";
import type { DataModel, Id } from "./_generated/dataModel";
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

async function sendMagicLinkEmail({
  identifier,
  url,
}: {
  identifier: string;
  url: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "Tempo Flow <onboarding@resend.dev>";
  const to = identifier;
  const subject = "Your Tempo Flow sign-in link";
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto; line-height: 1.5;">
      <h2 style="font-family: Newsreader, Georgia, serif;">Sign in to Tempo Flow</h2>
      <p>Use the button below to continue.</p>
      <p style="margin: 24px 0;">
        <a href="${url}" style="background:#D97757;color:white;padding:12px 18px;border-radius:10px;text-decoration:none;display:inline-block;font-weight:600;">
          Continue to Tempo Flow
        </a>
      </p>
      <p style="color:#6b7280;font-size:14px;">If you didn't request this email, you can ignore it.</p>
    </div>
  `;

  if (!resendApiKey) {
    console.warn(`[auth] RESEND_API_KEY not set. Magic link for ${to}: ${url}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Could not send sign-in email. ${body}`);
  }
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
  providers: [
    Password,
    Email({
      authorize: undefined,
      maxAge: 60 * 30,
      sendVerificationRequest: sendMagicLinkEmail,
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

      if (args.existingUserId) {
        const existingUserId = args.existingUserId;
        const existing = await db.get(existingUserId);

        // buildReturningUserPatch never returns an undefined value. Assigning
        // undefined here is what stripped entitlementTier, betaAccess,
        // isGodTier and userType on a returning user's SECOND sign-in --
        // Convex reads undefined in a patch as "delete this field".
        await db.patch(existingUserId, buildReturningUserPatch(existing ?? {}, profile, now));
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
