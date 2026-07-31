import { describe, expect, test } from "bun:test";
import {
  BRAIN_DUMP_MAX_RAW_CHARS,
  validateBrainDumpInput,
} from "./brainDumpInput";

describe("validateBrainDumpInput", () => {
  test("rejects empty or whitespace-only input", () => {
    expect(validateBrainDumpInput("")).toEqual({
      ok: false,
      message: "Paste something first — even a rough list is enough.",
    });
    expect(validateBrainDumpInput("   \n\t  ")).toEqual({
      ok: false,
      message: "Paste something first — even a rough list is enough.",
    });
  });

  test("accepts trimmed non-empty input within limit", () => {
    expect(validateBrainDumpInput("  pay rent  ")).toEqual({
      ok: true,
      raw: "pay rent",
    });
  });

  test("rejects input over the character cap", () => {
    const long = "x".repeat(BRAIN_DUMP_MAX_RAW_CHARS + 1);
    const result = validateBrainDumpInput(long);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain(String(BRAIN_DUMP_MAX_RAW_CHARS + 1));
      expect(result.message).toContain(String(BRAIN_DUMP_MAX_RAW_CHARS));
    }
  });
});
