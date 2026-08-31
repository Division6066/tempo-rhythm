import { readFileSync } from "node:fs";
import { describe, expect, test } from "bun:test";

describe("BYOK integrations wiring", () => {
  test("uses api.users provider-key functions, not a byok module", () => {
    const page = readFileSync("apps/web/app/(tempo)/settings/integrations/page.tsx", "utf8");
    expect(page).toContain("api.users.getProviderKey");
    expect(page).toContain("api.users.saveProviderKey");
    expect(page).not.toContain("api.byok.");
  });
});
