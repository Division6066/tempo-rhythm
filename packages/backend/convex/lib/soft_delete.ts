/**
 * Soft-delete helpers for user-owned Convex rows.
 * HARD_RULES §9 — hard deletes are forbidden for user-visible data.
 */

export function isLiveRow(row: { deletedAt?: number }): boolean {
  return row.deletedAt === undefined;
}

export function liveOnly<T extends { deletedAt?: number }>(rows: T[]): T[] {
  return rows.filter(isLiveRow);
}

export function softDeletePatch(now: number = Date.now()): {
  deletedAt: number;
  updatedAt: number;
} {
  return { deletedAt: now, updatedAt: now };
}
