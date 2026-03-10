import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  session: {
    totalDurationMs: 30 * 24 * 60 * 60 * 1000,
  },
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const now = Date.now();

      if (args.existingUserId) {
        await ctx.db.patch(args.existingUserId, {
          email: args.profile.email,
          emailVerified: args.profile.emailVerified ?? false,
          fullName: args.profile.name || "User",
          updatedAt: now,
        });
        return args.existingUserId;
      }

      return await ctx.db.insert("users", {
        email: args.profile.email ?? "",
        emailVerified: args.profile.emailVerified ?? false,
        fullName: args.profile.name || "User",
        role: "user",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    },
  },
});
