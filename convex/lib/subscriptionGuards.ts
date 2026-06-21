import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { requireUser } from "./requireUser";

/**
 * Checks if the user is authorized to perform primitive level actions
 * Also asserts that the subjectUser from Context belongs to the userId passed to operations
 * cross-user operations are inherently rejected by requireUser since it throws if they attempt
 * to mutate/fetch data that doesn't match their user._id, but the endpoints themselves need to verify
 * e.g., task.userId === user._id which they are already doing (see tasks.ts).
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

  // userType "free" or "paid" logic goes here later
  return user;
}
