/** Server-side mirror of web `MOCK_PAYMENTS` — set in Convex env for dev/staging only. */
export function isMockPaymentsEnabled(): boolean {
  return process.env.MOCK_PAYMENTS === "true";
}
