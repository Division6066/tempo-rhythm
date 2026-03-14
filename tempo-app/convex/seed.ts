import { internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

async function hashWithPBKDF2(password: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `pbkdf2:100000:${saltHex}:${hashHex}`;
}

export const seedBetaAccounts = internalAction({
  args: {},
  handler: async (ctx) => {
    const results: Array<{ email: string; password: string; status: string }> = [];

    for (let i = 1; i <= 10; i++) {
      const email = `beta${i}@tempo.app`;
      const password = `beta${i}pass`;

      try {
        const hashedPassword = await hashWithPBKDF2(password);
        await ctx.runMutation(internal.seed.upsertBetaUser, {
          email,
          hashedPassword,
          index: i,
        });
        results.push({ email, password, status: "created" });
      } catch (err: any) {
        results.push({ email, password, status: `error: ${err.message}` });
      }
    }

    return results;
  },
});

export const upsertBetaUser = internalMutation({
  args: {
    email: v.string(),
    hashedPassword: v.string(),
    index: v.number(),
  },
  handler: async (ctx, { email, hashedPassword, index }) => {
    const allUsers = await ctx.db.query("users").collect();
    let user = allUsers.find((u: any) => u.email === email);

    if (!user) {
      const userId = await ctx.db.insert("users", {
        email,
        emailVerificationTime: Date.now(),
      } as any);
      user = await ctx.db.get(userId);
    }

    if (!user) throw new Error("Failed to create user");

    const existingAccount = await ctx.db
      .query("authAccounts")
      .filter((q) =>
        q.and(
          q.eq(q.field("provider"), "password"),
          q.eq(q.field("providerAccountId"), email)
        )
      )
      .first();

    if (existingAccount) {
      await ctx.db.patch(existingAccount._id, { secret: hashedPassword } as any);
    } else {
      await ctx.db.insert("authAccounts", {
        userId: user._id,
        provider: "password",
        providerAccountId: email,
        secret: hashedPassword,
      } as any);
    }

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user!._id))
      .unique();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, { userType: "paid" as const });
    } else {
      await ctx.db.insert("profiles", {
        userId: user._id,
        fullName: `Beta Tester ${index}`,
        role: "user" as const,
        userType: "paid" as const,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});
