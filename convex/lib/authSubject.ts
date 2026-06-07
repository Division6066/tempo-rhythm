/**
 * Convex Auth encodes the app user id in `identity.subject` as
 * `authAccountId|userId`. Never pass the raw subject to `db.get` / `_id` filters.
 */
export function userIdFromAuthSubject(subject: string): string | null {
  const parts = subject.split("|");
  if (parts.length < 2) {
    return null;
  }
  const userId = parts[parts.length - 1]?.trim();
  return userId || null;
}
