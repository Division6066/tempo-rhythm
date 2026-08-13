import { afterEach, describe, expect, test } from "bun:test";
import {
  ENV_SENTINEL,
  isEnvConfigured,
  normalizeEnvValue,
  optionalEnv,
  requireEnv,
} from "./env";
import { AiEnvError } from "./errors";

const VAR = "TEMPO_AI_ENV_TEST_VAR";
const SECRET_VALUE = "sk-super-secret-value-9f8e7d6c5b4a";

afterEach(() => {
  delete process.env[VAR];
});

describe("normalizeEnvValue", () => {
  test("undefined stays undefined", () => {
    expect(normalizeEnvValue(undefined)).toBeUndefined();
  });
  test("empty string is absent", () => {
    expect(normalizeEnvValue("")).toBeUndefined();
  });
  test("whitespace-only is absent", () => {
    expect(normalizeEnvValue("   \t\n ")).toBeUndefined();
  });
  test("the scaffolding sentinel is absent", () => {
    expect(normalizeEnvValue(ENV_SENTINEL)).toBeUndefined();
  });
  test("a real value is trimmed and returned", () => {
    expect(normalizeEnvValue("  value  ")).toBe("value");
  });
});

describe("requireEnv", () => {
  test("throws AiEnvError when unset", () => {
    expect(() => requireEnv(VAR)).toThrow(AiEnvError);
  });

  test("throws when set to the sentinel", () => {
    process.env[VAR] = ENV_SENTINEL;
    expect(() => requireEnv(VAR)).toThrow(AiEnvError);
  });

  test("throws when set to whitespace", () => {
    process.env[VAR] = "   ";
    expect(() => requireEnv(VAR)).toThrow(AiEnvError);
  });

  test("error names the variable and the deployment dashboard", () => {
    try {
      requireEnv(VAR, { deployment: "convex" });
      throw new Error("expected requireEnv to throw");
    } catch (err) {
      const error = err as AiEnvError;
      expect(error.name).toBe("AiEnvError");
      expect(error.variableName).toBe(VAR);
      expect(error.message).toContain(VAR);
      expect(error.message).toContain("Convex dashboard");
    }
  });

  test("error message never contains the value (sentinel case)", () => {
    process.env[VAR] = ENV_SENTINEL;
    try {
      requireEnv(VAR);
      throw new Error("expected requireEnv to throw");
    } catch (err) {
      expect((err as Error).message).not.toContain(ENV_SENTINEL);
    }
  });

  test("returns the value when configured", () => {
    process.env[VAR] = SECRET_VALUE;
    expect(requireEnv(VAR)).toBe(SECRET_VALUE);
  });
});

describe("optionalEnv", () => {
  test("returns fallback when unset", () => {
    expect(optionalEnv(VAR, "fallback")).toBe("fallback");
  });
  test("returns fallback when sentinel", () => {
    process.env[VAR] = ENV_SENTINEL;
    expect(optionalEnv(VAR, "fallback")).toBe("fallback");
  });
  test("returns undefined when unset and no fallback", () => {
    expect(optionalEnv(VAR)).toBeUndefined();
  });
  test("returns the value when configured", () => {
    process.env[VAR] = "real";
    expect(optionalEnv(VAR, "fallback")).toBe("real");
  });
});

describe("isEnvConfigured", () => {
  test("false for unset / sentinel / empty, true for real", () => {
    expect(isEnvConfigured(VAR)).toBe(false);
    process.env[VAR] = "";
    expect(isEnvConfigured(VAR)).toBe(false);
    process.env[VAR] = ENV_SENTINEL;
    expect(isEnvConfigured(VAR)).toBe(false);
    process.env[VAR] = "real";
    expect(isEnvConfigured(VAR)).toBe(true);
  });
});
