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

/**
 * Checks if the user is authorized to perform primitive level actions
 * Also asserts that the subjectUser from Context belongs to the userId passed to operations
 */
export async function requireUserAccess(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users">> {
  const user = await requireUser(ctx);

  if (user.deletedAt !== undefined) {
    throw new Error("This account has been deleted. Please contact support.");
  }
  
  if (user.isActive === false) {
     throw new Error("This account is currently blocked or inactive.");
  }

  return user;
}
