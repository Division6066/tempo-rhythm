import { afterEach, describe, expect, test } from "bun:test";
import { GET } from "../../apps/web/app/api/health/route";

const ENV_KEY = "VERCEL_GIT_COMMIT_SHA";
const original = process.env[ENV_KEY];

afterEach(() => {
  if (original === undefined) {
    delete process.env[ENV_KEY];
  } else {
    process.env[ENV_KEY] = original;
  }
});

describe("GET /api/health", () => {
  test("returns 200 with the proof shape and a local commit when unset", async () => {
    delete process.env[ENV_KEY];
    const res = GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.service).toBe("tempo-web");
    expect(body.proof).toBe("P-CLAUDE");
    expect(body.commit).toMatch(/^([0-9a-f]{7}|local)$/);
    expect(body.commit).toBe("local");
  });

  test("truncates VERCEL_GIT_COMMIT_SHA to 7 characters", async () => {
    process.env[ENV_KEY] = "abcdef1234567";
    const res = GET();
    const body = await res.json();
    expect(body.commit).toBe("abcdef1");
  });
});
