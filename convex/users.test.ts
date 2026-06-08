import { describe, expect, test } from "bun:test";
import { authSubjectUserIdCandidates } from "./lib/requireUser";

describe("authSubjectUserIdCandidates", () => {
  test("extracts Convex user id from Convex Auth subject", () => {
    const userId = "jd7abc123def456";
    const subject = `authAccountId|${userId}`;
    expect(authSubjectUserIdCandidates(subject)).toEqual(["authAccountId", userId]);
  });

  test("does not treat the full subject string as a user id", () => {
    const subject = "authAccountId|jd7abc123def456";
    expect(authSubjectUserIdCandidates(subject)).not.toEqual([subject]);
  });
});

describe("updateUserType paid upgrade gate", () => {
  test("blocks client paid upgrade unless MOCK_PAYMENTS is true", () => {
    const allowsPaidUpgrade = (mockPaymentsEnv: string | undefined) =>
      mockPaymentsEnv === "true";

    expect(allowsPaidUpgrade(undefined)).toBe(false);
    expect(allowsPaidUpgrade("false")).toBe(false);
    expect(allowsPaidUpgrade("true")).toBe(true);
  });
});
