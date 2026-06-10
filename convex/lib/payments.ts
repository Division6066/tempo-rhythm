/** Server-side gate for dev-only mock paywall upgrades (users.updateUserType). */
export function isMockPaymentsEnabled(): boolean {
  return process.env.MOCK_PAYMENTS === "true";
}
