import { describe, expect, test } from "bun:test";
import { getAddEventAuthState, SERVER_ERROR_MESSAGE, toAddEventErrorMessage } from "./addEventGuard";

describe("add event auth guard", () => {
  test("waits while auth is loading, even if not yet authenticated", () => {
    expect(getAddEventAuthState({ isAuthenticated: false, isLoading: true })).toBe("wait");
  });

  test("is ready once authenticated and signed-out only after loading finishes", () => {
    expect(getAddEventAuthState({ isAuthenticated: true, isLoading: false })).toBe("ready");
    expect(getAddEventAuthState({ isAuthenticated: false, isLoading: false })).toBe("signed-out");
  });

  test("server errors never leak raw Convex text", () => {
    const raw = new Error('[CONVEX M(calendar_events:create)] {"code":"X"} Server Error');
    expect(toAddEventErrorMessage(raw)).toBe(SERVER_ERROR_MESSAGE);
    expect(toAddEventErrorMessage(raw)).not.toContain("CONVEX");
  });
});
