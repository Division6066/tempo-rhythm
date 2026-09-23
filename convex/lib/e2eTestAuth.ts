/** Convex Auth provider id for the gated e2e sign-in path leftover from #336. */
export const E2E_TEST_AUTH_PROVIDER_ID = "e2e-test-email";

/** Fixed verification code accepted only when the provider is registered. */
export const E2E_TEST_AUTH_CODE = "123456";

export function normalizeE2eTestAuthEmail(
  email: string | undefined | null,
): string {
  return (email ?? "").trim().toLowerCase();
}

type PublicEnv = { [key: string]: string | undefined };

export function readE2eTestAuthEmail(env: PublicEnv = process.env): string {
  return normalizeE2eTestAuthEmail(env.E2E_TEST_AUTH_EMAIL);
}

export function shouldRegisterE2eTestAuthProvider(email: string): boolean {
  return email.length > 0;
}

export function isE2eTestAuthAuthorized(
  params: { email?: unknown; code?: unknown },
  expectedEmail: string,
): boolean {
  if (!shouldRegisterE2eTestAuthProvider(expectedEmail)) {
    return false;
  }
  const email =
    typeof params.email === "string"
      ? normalizeE2eTestAuthEmail(params.email)
      : "";
  return email === expectedEmail && params.code === E2E_TEST_AUTH_CODE;
}
