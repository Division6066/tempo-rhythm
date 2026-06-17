const DEFAULT_FOUNDER_EMAIL = "amitlevin65@protonmail.com";
const DEFAULT_BETA_MAX_TESTERS = 30;

export function normalizeEmail(email: string | undefined | null): string {
  return (email ?? "").trim().toLowerCase();
}

export function resolveFounderEmail(envValue: string | undefined): string {
  return normalizeEmail(envValue ?? DEFAULT_FOUNDER_EMAIL);
}

export function parseBetaMaxTesters(envValue: string | undefined): number {
  const parsed = Number(String(envValue ?? DEFAULT_BETA_MAX_TESTERS));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_BETA_MAX_TESTERS;
}

export function buildAllowlistedEmails(
  envCsv: string | undefined,
  founderEmail: string,
): Set<string> {
  const fromEnv = String(envCsv ?? "")
    .split(",")
    .map((item) => normalizeEmail(item))
    .filter(Boolean);
  const allowlisted = new Set(fromEnv);
  allowlisted.add(normalizeEmail(founderEmail));
  return allowlisted;
}

export function isEmailAllowlisted(email: string, allowlisted: Set<string>): boolean {
  return allowlisted.has(normalizeEmail(email));
}

export type BetaTesterRow = {
  betaAccess?: string;
  deletedAt?: number;
};

/** Count active beta testers (excludes soft-deleted rows). */
export function countActiveBetaTesters(users: BetaTesterRow[]): number {
  return users.filter((user) => user.betaAccess === "tester" && user.deletedAt === undefined)
    .length;
}

/**
 * Whether a new signup can claim a beta tester seat.
 * Founders bypass the cap; invite-only is enforced separately via allowlist.
 */
export function canClaimBetaTesterSeat(
  activeTesterCount: number,
  maxTesters: number,
  isFounder: boolean,
): boolean {
  if (isFounder) {
    return true;
  }
  return activeTesterCount < maxTesters;
}
