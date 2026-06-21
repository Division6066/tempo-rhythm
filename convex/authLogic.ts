export const DEFAULT_FOUNDER_EMAIL = "amitlevin65@protonmail.com";
export const DEFAULT_BETA_MAX_TESTERS = 30;

export function normalizeEmail(email: string | undefined | null): string {
  return (email ?? "").trim().toLowerCase();
}

export function getFounderEmail(envFounderEmail?: string) {
  return normalizeEmail(String(envFounderEmail ?? DEFAULT_FOUNDER_EMAIL));
}

export function getAllowlistedEmails(envAllowlistEmails: string | undefined, envFounderEmail?: string) {
  const fromEnv = (String(envAllowlistEmails ?? ""))
    .split(",")
    .map((item: string) => normalizeEmail(item))
    .filter(Boolean);
  const allowlisted = new Set(fromEnv);
  allowlisted.add(getFounderEmail(envFounderEmail));
  return allowlisted;
}

export function getBetaMaxTesters(envMaxTesters?: string) {
  const parsed = Number(String(envMaxTesters ?? DEFAULT_BETA_MAX_TESTERS));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_BETA_MAX_TESTERS;
}
