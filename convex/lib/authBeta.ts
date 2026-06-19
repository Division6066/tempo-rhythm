export const DEFAULT_FOUNDER_EMAIL = "amitlevin65@protonmail.com";
export const DEFAULT_BETA_MAX_TESTERS = 30;

/** Normalize email for allowlist / founder comparisons. */
export function normalizeEmail(email: string | undefined | null): string {
  return (email ?? "").trim().toLowerCase();
}

/** Parse BETA_MAX_TESTERS env; falls back when missing or invalid. */
export function parseBetaMaxTesters(raw: string | undefined | null): number {
  const parsed = Number(String(raw ?? DEFAULT_BETA_MAX_TESTERS));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_BETA_MAX_TESTERS;
}

/** Founder email from env with repo default fallback. */
export function resolveFounderEmail(envFounderEmail: string | undefined | null): string {
  return normalizeEmail(envFounderEmail ?? DEFAULT_FOUNDER_EMAIL);
}

/** Comma-separated allowlist plus founder (founder is always included). */
export function buildAllowlistedEmails(
  envAllowlist: string | undefined | null,
  founderEmail: string,
): Set<string> {
  const fromEnv = String(envAllowlist ?? "")
    .split(",")
    .map((item) => normalizeEmail(item))
    .filter(Boolean);
  const allowlisted = new Set(fromEnv);
  allowlisted.add(founderEmail);
  return allowlisted;
}

/** Active beta testers exclude soft-deleted users. */
export function countActiveBetaTesters(
  users: ReadonlyArray<{ deletedAt?: number }>,
): number {
  return users.filter((user) => user.deletedAt === undefined).length;
}

/** Whether a new non-founder signup can claim a beta seat. */
export function isBetaSeatAvailable(activeTesterCount: number, maxTesters: number): boolean {
  return activeTesterCount < maxTesters;
}

export function isFounderEmail(email: string, founderEmail: string): boolean {
  return normalizeEmail(email) === normalizeEmail(founderEmail);
}
