import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/** Convex Auth subject format: `authAccountId|userId` (pipe-separated). */
export function splitAuthSubject(subject: string): string[] {
  return subject.split("|");
}

/** User id segment read by legacy fetchCurrentUser (second pipe segment). */
export function legacyUserIdFromAuthSubject(subject: string): string | null {
  const parts = splitAuthSubject(subject);
  return parts.length >= 2 ? (parts[1] ?? null) : null;
}

/** Resolve app user from Convex Auth subject by trying each pipe segment as a users id. */
export async function resolveUserFromSubject(
  ctx: QueryCtx | MutationCtx,
  subject: string,
): Promise<Doc<"users"> | null> {
  for (const part of splitAuthSubject(subject)) {
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
