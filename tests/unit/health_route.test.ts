import { describe, expect, test } from "bun:test";
import { GET } from "../../apps/web/app/api/health/route";

describe("GET /api/health", () => {
  test("returns ok shape with a local commit when unset", async () => {
    const previous = process.env.VERCEL_GIT_COMMIT_SHA;
    delete process.env.VERCEL_GIT_COMMIT_SHA;

    const response = GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.service).toBe("tempo-web");
    expect(body.proof).toBe("P-CLAUDE");
    expect(body.commit).toMatch(/^([0-9a-f]{7}|local)$/);

    if (previous === undefined) {
      delete process.env.VERCEL_GIT_COMMIT_SHA;
    } else {
      process.env.VERCEL_GIT_COMMIT_SHA = previous;
    }
  });

  test("truncates the commit sha to 7 characters", async () => {
    const previous = process.env.VERCEL_GIT_COMMIT_SHA;
    process.env.VERCEL_GIT_COMMIT_SHA = "abcdef1234567";

    const response = GET();
    const body = await response.json();
    expect(body.commit).toBe("abcdef1");

    if (previous === undefined) {
      delete process.env.VERCEL_GIT_COMMIT_SHA;
    } else {
      process.env.VERCEL_GIT_COMMIT_SHA = previous;
    }
  });
});
