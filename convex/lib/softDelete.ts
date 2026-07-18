export type SoftDeletable = {
  deletedAt?: number;
};

export function isLive<T extends SoftDeletable>(doc: T | null | undefined): doc is T {
  return doc !== null && doc !== undefined && doc.deletedAt === undefined;
}

export function filterLive<T extends SoftDeletable>(docs: T[]): T[] {
  return docs.filter(isLive);
}

export function softDeleteOnly(now = Date.now()): { deletedAt: number } {
  return { deletedAt: now };
}

export function softDeleteWithUpdatedAt(now = Date.now()): {
  deletedAt: number;
  updatedAt: number;
} {
  return { deletedAt: now, updatedAt: now };
}
