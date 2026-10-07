import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildExecutorSetup } from "../../apps/web/components/mcp/executorSetup";

const componentSource = readFileSync(
  join(import.meta.dir, "../../apps/web/components/mcp/McpTokensCard.tsx"),
  "utf8",
);
const guide = readFileSync(join(import.meta.dir, "../../docs/ops/EXECUTOR.md"), "utf8");

describe("buildExecutorSetup", () => {
  test("returns exact, separately copyable Executor field values without token data", () => {
    const endpoint = "https://tempo.example/api/mcp";
    const setup = buildExecutorSetup(endpoint);

    expect(setup).toEqual({
      endpoint,
      authorizationHeader: "Bearer <paste your token>",
    });
    expect(JSON.stringify(setup)).not.toContain("tmcp_");
  });

  test("keeps truthful copy labels, manual fallback, and read-only daily-plan docs", () => {
    expect(componentSource).toContain('"Copy endpoint"');
    expect(componentSource).toContain('"Copy header value"');
    expect(componentSource).toContain("copy it manually");
    expect(componentSource).not.toContain("Copy Executor setup");
    expect(guide).toContain("read your daily plan");
    expect(guide).toContain("daily-plan reads");
    expect(guide).not.toContain("update your tasks, notes, calendar, and daily plan");
  });
});
