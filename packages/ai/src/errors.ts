/**
 * Typed provider errors.
 *
 * SECURITY INVARIANT: an API key (or any fragment of one) must never appear
 * in an error message. Constructors here accept only pre-sanitized copy;
 * helpers that summarize upstream HTTP responses truncate bodies and strip
 * anything that looks like credential material.
 */

/** A required environment variable is missing / sentinel / empty. */
export class AiEnvError extends Error {
  readonly variableName: string;

  constructor(message: string, variableName: string) {
    super(message);
    this.name = "AiEnvError";
    this.variableName = variableName;
  }
}

/** The provider rejected our credentials (401/403). Never includes the key. */
export class ProviderAuthError extends Error {
  readonly provider: string;

  constructor(provider: string) {
    super(
      `${provider} rejected the configured API key. Check the key in its dashboard; the value is never logged.`,
    );
    this.name = "ProviderAuthError";
    this.provider = provider;
  }
}

/** The provider rate-limited us (429). */
export class ProviderRateLimitError extends Error {
  readonly provider: string;
  readonly retryAfterMs?: number;

  constructor(provider: string, retryAfterMs?: number) {
    super(`${provider} rate-limited the request.`);
    this.name = "ProviderRateLimitError";
    this.provider = provider;
    this.retryAfterMs = retryAfterMs;
  }
}

/** Any other non-2xx from the provider. Body is truncated and scrubbed. */
export class ProviderUpstreamError extends Error {
  readonly provider: string;
  readonly status: number;

  constructor(provider: string, status: number, safeDetail: string) {
    super(`${provider} returned HTTP ${status}: ${safeDetail}`);
    this.name = "ProviderUpstreamError";
    this.provider = provider;
    this.status = status;
  }
}

/**
 * Produce a log-safe detail string from an upstream response body: truncated,
 * with anything resembling bearer/token credentials redacted.
 */
export function safeUpstreamDetail(body: string, maxLength = 200): string {
  const redacted = body
    // Authorization header echoes: "Token abc...", "Bearer abc..."
    .replace(/\b(Token|Bearer)\s+[A-Za-z0-9._~+/=-]{8,}/gi, "$1 [redacted]")
    // Long unbroken secret-looking strings (API keys are ≥ 20 chars).
    .replace(/\b[A-Za-z0-9_-]{28,}\b/g, "[redacted]");
  return redacted.slice(0, maxLength);
}
