import type { MutationCtx, QueryCtx } from "../_generated/server";
import { fetchCurrentUser } from "../users";

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const user = await fetchCurrentUser(ctx);
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}
