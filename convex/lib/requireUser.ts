import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Resolve the authenticated app user (users table row) from Convex Auth identity.
 */
export async function resolveUserFromSubject(
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

export async function findUserByIdentity(ctx: QueryCtx | MutationCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const subjectUser = await resolveUserFromSubject(ctx, identity.subject);
  if (subjectUser) {
    return isActiveUser(subjectUser) ? subjectUser : null;
  }

  const email = identity.email?.trim().toLowerCase();
  if (!email) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();
  return user && isActiveUser(user) ? user : null;
}

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const user = await findUserByIdentity(ctx);
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

function isActiveUser(user: Doc<"users">) {
  return user.deletedAt === undefined && user.isActive !== false;
}
