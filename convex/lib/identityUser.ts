import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type UserCtx = Pick<QueryCtx | MutationCtx, "db">;

/**
 * Resolve the app user row from a Convex Auth `identity.subject`.
 * Tries each pipe-delimited segment as a users-table id before falling back.
 */
export async function resolveUserFromSubject(
  ctx: UserCtx,
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

/** First users-table id embedded in a Convex Auth subject, if any. */
export function userIdFromAuthSubject(subject: string): Id<"users"> | null {
  const parts = subject.split("|");
  if (parts.length < 2) {
    return null;
  }
  return parts[1] as Id<"users">;
}
