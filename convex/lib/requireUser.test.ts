import { describe, expect, test } from "bun:test";

/**
 * Documents Convex Auth subject shape used by resolveUserFromSubject.
 * Full resolver is integration-tested via Convex; this locks the parsing contract.
 */
function extractUserIdCandidates(subject: string): string[] {
  return subject.split("|");
}

describe("Convex Auth subject parsing", () => {
  test("splits authAccountId|userId into lookup candidates", () => {
    const subject = "authAccount123|jd7abc123users456";
    expect(extractUserIdCandidates(subject)).toEqual([
      "authAccount123",
      "jd7abc123users456",
    ]);
  });

  test("handles subjects without pipe as single candidate", () => {
    expect(extractUserIdCandidates("onlyOnePart")).toEqual(["onlyOnePart"]);
  });
});
