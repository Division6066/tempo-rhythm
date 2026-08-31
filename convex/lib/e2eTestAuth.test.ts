import { describe, expect, test } from "bun:test";
import {
  E2E_TEST_AUTH_CODE,
  E2E_TEST_AUTH_PROVIDER_ID,
  isE2eTestAuthAuthorized,
  normalizeE2eTestAuthEmail,
  readE2eTestAuthEmail,
  shouldRegisterE2eTestAuthProvider,
} from "./e2eTestAuth";

describe("e2eTestAuth", () => {
  test("provider id stays stable for Playwright sign-in", () => {
    expect(E2E_TEST_AUTH_PROVIDER_ID).toBe("e2e-test-email");
  });

  test("readE2eTestAuthEmail treats missing or blank env as unset", () => {
    expect(readE2eTestAuthEmail({})).toBe("");
    expect(readE2eTestAuthEmail({ E2E_TEST_AUTH_EMAIL: "   " })).toBe("");
    expect(shouldRegisterE2eTestAuthProvider("")).toBe(false);
  });

  test("readE2eTestAuthEmail trims and lowercases a configured address", () => {
    expect(
      readE2eTestAuthEmail({
        E2E_TEST_AUTH_EMAIL: " Tester@Example.com ",
      } satisfies { [key: string]: string | undefined }),
    ).toBe("tester@example.com");
    expect(shouldRegisterE2eTestAuthProvider("tester@example.com")).toBe(true);
  });

  test("authorize requires the exact configured email and fixed code", () => {
    const expected = normalizeE2eTestAuthEmail("tester@example.com");

    expect(
      isE2eTestAuthAuthorized(
        { email: "tester@example.com", code: E2E_TEST_AUTH_CODE },
        expected,
      ),
    ).toBe(true);
    expect(
      isE2eTestAuthAuthorized(
        { email: "other@example.com", code: E2E_TEST_AUTH_CODE },
        expected,
      ),
    ).toBe(false);
    expect(
      isE2eTestAuthAuthorized(
        { email: "tester@example.com", code: "000000" },
        expected,
      ),
    ).toBe(false);
    expect(
      isE2eTestAuthAuthorized(
        { email: "tester@example.com", code: E2E_TEST_AUTH_CODE },
        "",
      ),
    ).toBe(false);
  });
});
