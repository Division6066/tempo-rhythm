export const DEFAULT_FOUNDER_EMAIL = "amitlevin65@protonmail.com";
export const DEFAULT_BETA_MAX_TESTERS = 30;

export function normalizeEmail(email: string | undefined | null): string {
  return (email ?? "").trim().toLowerCase();
}

export type BetaAccessConfig = {
  founderEmail: string;
  allowlistedEmails: Set<string>;
  maxTesters: number;
};

export type BetaAccessEnv = {
  BETA_FOUNDER_EMAIL?: string;
  BETA_ALLOWLIST_EMAILS?: string;
  BETA_MAX_TESTERS?: string;
};

export function resolveBetaAccessConfig(
  env: BetaAccessEnv = process.env as BetaAccessEnv,
): BetaAccessConfig {
  const founderEmail = normalizeEmail(env.BETA_FOUNDER_EMAIL ?? DEFAULT_FOUNDER_EMAIL);
  const fromEnv = String(env.BETA_ALLOWLIST_EMAILS ?? "")
    .split(",")
    .map((item) => normalizeEmail(item))
    .filter(Boolean);
  const allowlistedEmails = new Set(fromEnv);
  allowlistedEmails.add(founderEmail);

  const parsed = Number(String(env.BETA_MAX_TESTERS ?? DEFAULT_BETA_MAX_TESTERS));
  const maxTesters =
    Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_BETA_MAX_TESTERS;

  return { founderEmail, allowlistedEmails, maxTesters };
}

export function isFounderEmail(email: string, founderEmail: string): boolean {
  return normalizeEmail(email) === normalizeEmail(founderEmail);
}

export function isAllowlisted(email: string, allowlistedEmails: Set<string>): boolean {
  return allowlistedEmails.has(normalizeEmail(email));
}

export type BetaUserRow = {
  betaAccess?: "founder" | "tester" | "none";
  deletedAt?: number;
};

export function countActiveBetaTesters(users: BetaUserRow[]): number {
  return users.filter(
    (user) => user.betaAccess === "tester" && user.deletedAt === undefined,
  ).length;
}

export function areBetaSeatsFull(testerCount: number, maxTesters: number): boolean {
  return testerCount >= maxTesters;
}
