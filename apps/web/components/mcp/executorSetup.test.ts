import { describe, expect, test } from "bun:test";
import { buildExecutorSetup } from "./executorSetup";

describe("buildExecutorSetup", () => {
  test("builds a copy-ready Executor source without a real-looking token", () => {
    const endpoint = "https://tempo.example/api/mcp";
    const setup = buildExecutorSetup(endpoint);

    expect(setup).toContain("Source type: Streamable HTTP");
    expect(setup).toContain(`URL: ${endpoint}`);
    expect(setup).toContain("Authorization: Bearer <paste your token>");
    expect(setup).not.toContain("tmcp_");
  });
});
