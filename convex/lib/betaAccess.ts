export const DEFAULT_FOUNDER_EMAIL = "amitlevin65@protonmail.com";
export const DEFAULT_BETA_MAX_TESTERS = 30;

export function normalizeEmail(email: string | undefined | null): string {
  return (email ?? "").trim().toLowerCase();
}

export function getFounderEmail(envFounder?: string | null): string {
  return normalizeEmail(envFounder ?? DEFAULT_FOUNDER_EMAIL);
}

export function getAllowlistedEmails(
  envAllowlist?: string | null,
  founderEmail?: string,
): Set<string> {
  const founder = founderEmail ?? DEFAULT_FOUNDER_EMAIL;
  const fromEnv = (envAllowlist ?? "")
    .split(",")
    .map((item) => normalizeEmail(item))
    .filter(Boolean);
  const allowlisted = new Set(fromEnv);
  allowlisted.add(normalizeEmail(founder));
  return allowlisted;
}

export function getBetaMaxTesters(envMax?: string | number | null): number {
  const parsed = Number(String(envMax ?? DEFAULT_BETA_MAX_TESTERS));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_BETA_MAX_TESTERS;
}

export type BetaUserRow = {
  betaAccess?: string;
  deletedAt?: number;
};

/** Active beta testers only — soft-deleted rows do not consume a seat. */
export function countActiveBetaTesters(users: BetaUserRow[]): number {
  return users.filter((user) => user.betaAccess === "tester" && user.deletedAt === undefined)
    .length;
}

export type BetaSignupDecision =
  | { allowed: true }
  | { allowed: false; reason: "not_allowlisted" | "seats_full" };

export function evaluateBetaSignup(args: {
  email: string;
  allowlistedEmails: Set<string>;
  isFounder: boolean;
  activeTesterCount: number;
  maxTesters: number;
}): BetaSignupDecision {
  if (!args.allowlistedEmails.has(normalizeEmail(args.email))) {
    return { allowed: false, reason: "not_allowlisted" };
  }
  if (args.isFounder) {
    return { allowed: true };
  }
  if (args.activeTesterCount >= args.maxTesters) {
    return { allowed: false, reason: "seats_full" };
  }
  return { allowed: true };
}
