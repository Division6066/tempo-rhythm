export const DEFAULT_FOUNDER_EMAIL = "amitlevin65@protonmail.com";
export const DEFAULT_BETA_MAX_TESTERS = 30;

export function normalizeEmail(email: string | undefined | null): string {
  return (email ?? "").trim().toLowerCase();
}

export function parseBetaMaxTesters(
  raw: string | number | undefined,
  fallback = DEFAULT_BETA_MAX_TESTERS,
): number {
  const parsed = Number(String(raw ?? fallback));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function buildAllowlist(envAllowlist: string, founderEmail: string): Set<string> {
  const fromEnv = envAllowlist
    .split(",")
    .map((item) => normalizeEmail(item))
    .filter(Boolean);
  const allowlisted = new Set(fromEnv);
  allowlisted.add(normalizeEmail(founderEmail));
  return allowlisted;
}

export type BetaSignupCheckInput = {
  email: string;
  allowlist: Set<string>;
  activeTesterCount: number;
  maxTesters: number;
  isFounder: boolean;
};

export type BetaSignupDenyReason = "not_allowlisted" | "seats_full";

export function checkBetaSignupEligibility(
  input: BetaSignupCheckInput,
): { allowed: true } | { allowed: false; reason: BetaSignupDenyReason } {
  const email = normalizeEmail(input.email);
  if (!input.allowlist.has(email)) {
    return { allowed: false, reason: "not_allowlisted" };
  }
  if (!input.isFounder && input.activeTesterCount >= input.maxTesters) {
    return { allowed: false, reason: "seats_full" };
  }
  return { allowed: true };
}

export function countActiveTesters(
  users: Array<{ betaAccess?: string; deletedAt?: number }>,
): number {
  return users.filter((user) => user.betaAccess === "tester" && user.deletedAt === undefined)
    .length;
}
