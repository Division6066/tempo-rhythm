/** Ensure a mutation only touches the authenticated user's own record. */
export function assertSelfUserId(actorUserId: string, targetUserId: string): void {
  if (actorUserId !== targetUserId) {
    throw new Error("Unauthorized");
  }
}
