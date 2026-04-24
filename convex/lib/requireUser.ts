import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Resolve the authenticated app user (users table row) from Convex Auth identity.
 */
async function resolveUserFromSubject(
  ctx: QueryCtx | MutationCtx,
  subject: string,
): Promise<Doc<"users"> | null> {
  for (const part of subject.split("|")) {
    const normalizedId = ctx.db.normalizeId("users", part);
    if (!normalizedId) {
      continue;
    }
    const user = await ctx.db.get(normalizedId);
    if (user) {
      return user;
    }
  }
  return null;
}

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const subjectUser = await resolveUserFromSubject(ctx, identity.subject);
  if (subjectUser) {
    return subjectUser;
  }

  if (!identity.email) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", identity.email))
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
