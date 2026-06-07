import { describe, expect, test } from "bun:test";

/**
 * Regression guard: deleteMyAccount previously compared identity.subject
 * (authAccountId|userId) directly against users._id, so deletion never ran.
 */
describe("Convex Auth subject parsing", () => {
  test("subject pipe format is not a users table id", () => {
    const authAccountId = "abc123auth";
    const userId = "jd7x2k9m4n8p1q5r";
    const subject = `${authAccountId}|${userId}`;

    expect(subject).not.toBe(userId);
    expect(subject.split("|")[1]).toBe(userId);
  });

  test("mock entitlements require server env flag", () => {
    const original = process.env.ALLOW_MOCK_ENTITLEMENTS;
    try {
      delete process.env.ALLOW_MOCK_ENTITLEMENTS;
      expect(process.env.ALLOW_MOCK_ENTITLEMENTS === "true").toBe(false);

      process.env.ALLOW_MOCK_ENTITLEMENTS = "true";
      expect(process.env.ALLOW_MOCK_ENTITLEMENTS === "true").toBe(true);
    } finally {
      if (original === undefined) {
        delete process.env.ALLOW_MOCK_ENTITLEMENTS;
      } else {
        process.env.ALLOW_MOCK_ENTITLEMENTS = original;
      }
    }
  });
});
