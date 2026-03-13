import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  session: {
    totalDurationMs: 30 * 24 * 60 * 60 * 1000,
  },
});
