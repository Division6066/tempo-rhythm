import type { Page } from "@playwright/test";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const e2eTestAuthEmail = process.env.E2E_TEST_AUTH_EMAIL?.trim().toLowerCase();
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export async function signInWithE2eTestEmail(page: Page) {
  if (!e2eTestAuthEmail || !convexUrl) {
    throw new Error("E2E test auth is not configured.");
  }

  const client = new ConvexHttpClient(convexUrl);
  const result = await client.action(api.auth.signIn, {
    provider: "e2e-test-email",
    params: { email: e2eTestAuthEmail, code: "123456" },
  });
  const tokens = result.tokens;
  if (!tokens?.token || !tokens.refreshToken) {
    throw new Error("E2E test sign-in did not return tokens.");
  }

  const namespace = convexUrl.replace(/[^a-z0-9]/gi, "");
  await page.addInitScript(
    ({ jwt, namespace: authNamespace, refreshToken }) => {
      window.localStorage.setItem(`__convexAuthJWT_${authNamespace}`, jwt);
      window.localStorage.setItem(`__convexAuthRefreshToken_${authNamespace}`, refreshToken);
    },
    { jwt: tokens.token, namespace, refreshToken: tokens.refreshToken },
  );

  await page.goto("/today");
  await page.waitForURL(/\/today(?:\?|$)/);
}
