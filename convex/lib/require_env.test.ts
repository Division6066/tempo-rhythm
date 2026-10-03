import { afterEach, describe, expect, test } from "bun:test";
import { ENV_DUMMY_SENTINEL, readEnv, readEnvFirst, requireEnv } from "./require_env";

const TRACKED = ["UNIT_TEST_ENV_A", "UNIT_TEST_ENV_B"] as const;

afterEach(() => {
  for (const name of TRACKED) {
    delete process.env[name];
  }
});

describe("readEnv", () => {
  test("returns undefined when unset", () => {
    expect(readEnv("UNIT_TEST_ENV_A")).toBeUndefined();
  });

  test("returns undefined for blank and whitespace", () => {
    process.env.UNIT_TEST_ENV_A = "";
    expect(readEnv("UNIT_TEST_ENV_A")).toBeUndefined();
    process.env.UNIT_TEST_ENV_A = "   ";
    expect(readEnv("UNIT_TEST_ENV_A")).toBeUndefined();
  });

  test("treats the dashboard dummy sentinel as absent", () => {
    process.env.UNIT_TEST_ENV_A = ENV_DUMMY_SENTINEL;
    expect(readEnv("UNIT_TEST_ENV_A")).toBeUndefined();
    process.env.UNIT_TEST_ENV_A = `  ${ENV_DUMMY_SENTINEL}  `;
    expect(readEnv("UNIT_TEST_ENV_A")).toBeUndefined();
  });

  test("returns a trimmed real value", () => {
    process.env.UNIT_TEST_ENV_A = "  real-value  ";
    expect(readEnv("UNIT_TEST_ENV_A")).toBe("real-value");
  });
});

describe("readEnvFirst", () => {
  test("skips dummy and blank names, then returns the first real value", () => {
    process.env.UNIT_TEST_ENV_A = ENV_DUMMY_SENTINEL;
    process.env.UNIT_TEST_ENV_B = "legacy";
    expect(readEnvFirst(["UNIT_TEST_ENV_A", "UNIT_TEST_ENV_B"])).toBe("legacy");
  });

  test("returns undefined when every candidate is absent", () => {
    expect(readEnvFirst(["UNIT_TEST_ENV_A", "UNIT_TEST_ENV_B"])).toBeUndefined();
  });
});

describe("requireEnv", () => {
  test("throws a named error for unset and dummy values", () => {
    expect(() => requireEnv("UNIT_TEST_ENV_A")).toThrow("UNIT_TEST_ENV_A is not set");
    process.env.UNIT_TEST_ENV_A = ENV_DUMMY_SENTINEL;
    expect(() => requireEnv("UNIT_TEST_ENV_A")).toThrow("UNIT_TEST_ENV_A is not set");
  });

  test("returns a real value", () => {
    process.env.UNIT_TEST_ENV_A = "ok";
    expect(requireEnv("UNIT_TEST_ENV_A")).toBe("ok");
  });
});
