export const DEFAULT_FOUNDER_EMAIL = "amitlevin65@protonmail.com";
export const DEFAULT_BETA_MAX_TESTERS = 30;

export type BetaUserRow = {
  betaAccess?: string;
  deletedAt?: number;
};

/** Normalize email for allowlist and founder comparisons. */
export function normalizeEmail(email: string | undefined | null): string {
  return (email ?? "").trim().toLowerCase();
}

/** Parse a comma-separated allowlist env string into normalized emails. */
export function parseAllowlistCsv(raw: string | undefined | null): string[] {
  return (raw ?? "")
    .split(",")
    .map((item) => normalizeEmail(item))
    .filter(Boolean);
}

/** Build the effective beta allowlist (env entries + founder email). */
export function buildBetaAllowlist(
  envAllowlistCsv: string | undefined | null,
  founderEmail: string,
): Set<string> {
  const allowlisted = new Set(parseAllowlistCsv(envAllowlistCsv));
  allowlisted.add(normalizeEmail(founderEmail));
  return allowlisted;
}

/** Parse beta seat cap from env; falls back when missing or invalid. */
export function parseBetaMaxTesters(
  raw: string | number | undefined | null,
  fallback = DEFAULT_BETA_MAX_TESTERS,
): number {
  const parsed = Number(String(raw ?? fallback));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Count active beta testers (non-deleted users with betaAccess = tester). */
export function countActiveBetaTesters(users: BetaUserRow[]): number {
  return users.filter(
    (user) => user.betaAccess === "tester" && user.deletedAt === undefined,
  ).length;
}

/** Whether a new non-founder signup can claim a beta seat. */
export function canClaimBetaSeat(
  isFounder: boolean,
  activeTesterCount: number,
  maxTesters: number,
): boolean {
  if (isFounder) return true;
  return activeTesterCount < maxTesters;
}

/** Whether an email is on the beta allowlist. */
export function isEmailAllowlisted(email: string, allowlist: Set<string>): boolean {
  return allowlist.has(normalizeEmail(email));
}
