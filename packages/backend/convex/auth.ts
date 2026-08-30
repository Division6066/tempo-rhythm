import { Email } from "@convex-dev/auth/providers/Email";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import type { GenericMutationCtx } from "convex/server";
import type { DataModel } from "./_generated/dataModel";

const DEFAULT_FOUNDER_EMAIL = "amitlevin65@protonmail.com";
const DEFAULT_BETA_MAX_TESTERS = 30;

function normalizeEmail(email: string | undefined | null): string {
  return (email ?? "").trim().toLowerCase();
}

function getFounderEmail() {
  return normalizeEmail(String(process.env.BETA_FOUNDER_EMAIL ?? DEFAULT_FOUNDER_EMAIL));
}

function getAllowlistedEmails() {
  const fromEnv = (String(process.env.BETA_ALLOWLIST_EMAILS ?? ""))
    .split(",")
    .map((item: string) => normalizeEmail(item))
    .filter(Boolean);
  const allowlisted = new Set(fromEnv);
  allowlisted.add(getFounderEmail());
  return allowlisted;
}

function getBetaMaxTesters() {
  const parsed = Number(String(process.env.BETA_MAX_TESTERS ?? DEFAULT_BETA_MAX_TESTERS));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_BETA_MAX_TESTERS;
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
      const db = ctx.db as unknown as GenericMutationCtx<DataModel>["db"];
      const now = Date.now();
      const email = normalizeEmail(args.profile.email);
      const founderEmail = getFounderEmail();
      const allowlistedEmails = getAllowlistedEmails();
      const isFounder = email === founderEmail;

      const profileName = typeof args.profile.name === "string" ? args.profile.name : "User";

      if (args.existingUserId) {
        const existingUserId = args.existingUserId;
        await db.patch(existingUserId, {
          email,
          emailVerified: args.profile.emailVerified ?? false,
          fullName: profileName,
          betaAccess: isFounder ? "founder" : undefined,
          entitlementTier: isFounder ? "god" : undefined,
          isGodTier: isFounder || undefined,
          userType: isFounder ? "paid" : undefined,
          updatedAt: now,
        });

        if (isFounder) {
          const existingState = await db
            .query("subscriptionStates")
            .withIndex("by_userId", (q) => q.eq("userId", existingUserId))
            .unique();
          if (existingState) {
            await db.patch(existingState._id, {
              plan: "max",
              billingCycle: "lifetime",
              status: "active",
              source: "founder_whitelist_override",
              trialUsed: true,
              updatedAt: now,
            });
          } else {
            await db.insert("subscriptionStates", {
              userId: existingUserId,
              plan: "max",
              billingCycle: "lifetime",
              status: "active",
              source: "founder_whitelist_override",
              trialUsed: true,
              createdAt: now,
              updatedAt: now,
            });
          }
        }

        return args.existingUserId;
      }

      if (!allowlistedEmails.has(email)) {
        throw new Error("Beta access is invite-only right now. Ask for an invite and we can add you.");
      }

      if (!isFounder) {
        const activeTesters = await db
          .query("users")
          .withIndex("by_betaAccess", (q) => q.eq("betaAccess", "tester"))
          .collect();
        const testerCount = activeTesters.filter((user) => user.deletedAt === undefined).length;
        if (testerCount >= getBetaMaxTesters()) {
          throw new Error("All beta seats are currently filled. We can add you to the next wave.");
        }
      }

      const userId = await db.insert("users", {
        email,
        emailVerified: args.profile.emailVerified ?? false,
        fullName: profileName,
        role: "user",
        userType: isFounder ? "paid" : "free",
        betaAccess: isFounder ? "founder" : "tester",
        entitlementTier: isFounder ? "god" : "none",
        isGodTier: isFounder,
        betaApprovedAt: now,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert("subscriptionStates", {
        userId,
        plan: isFounder ? "max" : "none",
        billingCycle: isFounder ? "lifetime" : "none",
        status: isFounder ? "active" : "inactive",
        trialUsed: isFounder,
        source: isFounder ? "founder_whitelist_override" : "beta_signup",
        createdAt: now,
        updatedAt: now,
      });

      return userId;
    },
    async beforeSessionCreation(ctx, args) {
      const db = ctx.db as unknown as GenericMutationCtx<DataModel>["db"];
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
