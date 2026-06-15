export const DEFAULT_FOUNDER_EMAIL = "amitlevin65@protonmail.com";
export const DEFAULT_BETA_MAX_TESTERS = 30;

/** Trim + lowercase for invite checks and founder matching. */
export function normalizeEmail(email: string | undefined | null): string {
  return (email ?? "").trim().toLowerCase();
}

export function resolveFounderEmail(envValue: string | undefined): string {
  return normalizeEmail(envValue ?? DEFAULT_FOUNDER_EMAIL);
}

export function parseBetaMaxTesters(
  envValue: string | undefined,
  fallback = DEFAULT_BETA_MAX_TESTERS,
): number {
  const parsed = Number(String(envValue ?? fallback));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Comma-separated allowlist from env, always including the founder email. */
export function buildAllowlistedEmails(
  allowlistEnv: string | undefined,
  founderEmail: string,
): Set<string> {
  const fromEnv = (allowlistEnv ?? "")
    .split(",")
    .map((item) => normalizeEmail(item))
    .filter(Boolean);
  const allowlisted = new Set(fromEnv);
  allowlisted.add(founderEmail);
  return allowlisted;
}
