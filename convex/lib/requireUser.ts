import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Resolve the authenticated app user (users table row) from Convex Auth identity.
 *
 * Convex Auth's `identity.subject` packs two ids separated by `|` — the exact
 * shape varies across auth versions (`authAccountId|userId`,
 * `authSessionId|userId`, etc.). We can't rely on the order, so we iterate all
 * parts and use `ctx.db.normalizeId("users", part)` to find the one that is
 * actually a users row. `identity.email` is not always set.
 */
export async function requireUser(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const subjectParts = identity.subject.split("|");
  for (const part of subjectParts) {
    const normalized: Id<"users"> | null = ctx.db.normalizeId("users", part);
    if (normalized) {
      const row = await ctx.db.get(normalized);
      if (row) return row;
    }
  }

  // Fallback — email lookup. This is rarely reached in practice because the
  // Password provider does not populate `identity.email`, but keep it for other
  // providers that may.
  const email = identity.email;
  if (email) {
    const fromEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (fromEmail) return fromEmail;
  }

  throw new Error("Not authenticated");
}
