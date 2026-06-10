export type WebhookAuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; reason: string };

/** Fail closed when the webhook secret is unset. */
export function validateRevenueCatWebhookAuth(
  authHeader: string | null,
  webhookSecret: string | undefined,
): WebhookAuthResult {
  if (!webhookSecret) {
    return { ok: false, status: 503, reason: "Webhook not configured" };
  }
  if (authHeader !== webhookSecret) {
    return { ok: false, status: 401, reason: "Unauthorized" };
  }
  return { ok: true };
}
