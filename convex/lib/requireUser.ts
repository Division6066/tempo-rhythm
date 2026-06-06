import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export function isActiveUser(user: Pick<Doc<"users">, "deletedAt" | "isActive">) {
  return user.deletedAt === undefined && user.isActive !== false;
}

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
    if (!isActiveUser(subjectUser)) {
      throw new Error("Account inactive");
    }
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
  if (!isActiveUser(user)) {
    throw new Error("Account inactive");
  }

  return user;
}
