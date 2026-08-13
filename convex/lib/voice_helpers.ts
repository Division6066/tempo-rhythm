/**
 * Pure helpers for the voice pipeline — no Convex imports so everything here
 * is unit-tested under bun (convex/voice_helpers.test.ts).
 */

/** Entitlement tiers as stored on users.entitlementTier. */
export type EntitlementTier = "none" | "basic" | "pro" | "max" | "god";

/**
 * HARD_RULES §9 — live (streaming) voice daily caps in minutes of real
 * audio. Walkie-talkie (batch) voice is universal and NOT covered by these
 * caps. `null` means unlimited. Tier "none" gets no live voice on Tempo's
 * key — a personal (BYOK) Deepgram key bypasses the cap entirely.
 */
export function streamingCapMinutes(
  tier: EntitlementTier | undefined,
): number | null {
  switch (tier) {
    case "god":
      return null;
    case "max":
      return 180;
    case "pro":
      return 90;
    case "basic":
      return 30;
    case "none":
    case undefined:
      return 0;
    default: {
      const exhaustive: never = tier;
      return exhaustive;
    }
  }
}

/** Clamp a session duration to a sane range: [0, 2 hours]. */
export function clampSessionDurationMs(durationMs: number): number {
  const MAX_SESSION_MS = 2 * 60 * 60 * 1000;
  if (!Number.isFinite(durationMs) || durationMs < 0) return 0;
  return Math.min(durationMs, MAX_SESSION_MS);
}

const LOCAL_DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Validate a client-supplied "YYYY-MM-DD" local-day key. */
export function isValidLocalDay(localDay: string): boolean {
  return LOCAL_DAY_RE.test(localDay);
}

/**
 * Constant-time string comparison for the transcription-callback shared
 * secret. Comparison time depends only on the attacker-supplied length, not
 * on how many leading characters match.
 */
export function timingSafeEqualStrings(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  const length = Math.max(aBytes.length, bBytes.length);
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < length; i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

/**
 * Sum used streaming milliseconds for a set of session rows, counting open
 * sessions (no endedAt yet) as running until `now`.
 */
export function usedStreamingMs(
  sessions: Array<{ startedAt: number; endedAt?: number; durationMs?: number }>,
  now: number,
): number {
  let total = 0;
  for (const session of sessions) {
    if (session.durationMs !== undefined) {
      total += clampSessionDurationMs(session.durationMs);
    } else if (session.endedAt !== undefined) {
      total += clampSessionDurationMs(session.endedAt - session.startedAt);
    } else {
      total += clampSessionDurationMs(now - session.startedAt);
    }
  }
  return total;
}

/**
 * Build the async-transcription callback URL Deepgram will POST to.
 * The shared secret rides as a query parameter and is validated by the
 * httpAction with a constant-time comparison.
 */
export function buildCallbackUrl(opts: {
  siteUrl: string;
  secret: string;
  noteId: string;
}): string {
  const base = opts.siteUrl.replace(/\/+$/, "");
  const params = new URLSearchParams({
    secret: opts.secret,
    noteId: opts.noteId,
  });
  return `${base}/api/deepgram-callback?${params}`;
}
