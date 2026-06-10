import type { MutationCtx, QueryCtx } from "../_generated/server";
import { resolveUserFromSubject } from "./identityUser";

export { resolveUserFromSubject } from "./identityUser";

/**
 * Resolve the authenticated app user (users table row) from Convex Auth identity.
 */
export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const subjectUser = await resolveUserFromSubject(ctx, identity.subject);
  if (subjectUser) {
    return subjectUser;
  }

  const email = identity.email;
  if (!email) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
