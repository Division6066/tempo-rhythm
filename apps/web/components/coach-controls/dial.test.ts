import { describe, expect, test } from "bun:test";
import { clampDial, dialLabel, panicMinutesLeft } from "./dial";

describe("clampDial", () => {
  test("keeps integers from 0 to 10", () => {
    expect(clampDial(0)).toBe(0);
    expect(clampDial(5)).toBe(5);
    expect(clampDial(10)).toBe(10);
  });

  test("rounds to the nearest integer and clamps the ends", () => {
    expect(clampDial(2.4)).toBe(2);
    expect(clampDial(2.5)).toBe(3);
    expect(clampDial(-1)).toBe(0);
    expect(clampDial(-0.4)).toBe(0);
    expect(clampDial(11)).toBe(10);
    expect(clampDial(10.6)).toBe(10);
  });

  test("NaN and non-finite values become 5", () => {
    expect(clampDial(Number.NaN)).toBe(5);
    expect(clampDial(Number.POSITIVE_INFINITY)).toBe(5);
    expect(clampDial(Number.NEGATIVE_INFINITY)).toBe(5);
  });
});

describe("dialLabel", () => {
  test("names the three bands", () => {
    expect(dialLabel(0)).toBe("Gentle");
    expect(dialLabel(3)).toBe("Gentle");
    expect(dialLabel(4)).toBe("Steady");
    expect(dialLabel(6)).toBe("Steady");
    expect(dialLabel(7)).toBe("Firm");
    expect(dialLabel(10)).toBe("Firm");
  });

  test("labels the clamped value", () => {
    expect(dialLabel(Number.NaN)).toBe("Steady");
    expect(dialLabel(-4)).toBe("Gentle");
    expect(dialLabel(99)).toBe("Firm");
  });
});

describe("panicMinutesLeft", () => {
  const now = 1_700_000_000_000;

  test("is zero when there is no active panic", () => {
    expect(panicMinutesLeft(null, now)).toBe(0);
    expect(panicMinutesLeft(now, now)).toBe(0);
    expect(panicMinutesLeft(now - 1, now)).toBe(0);
    expect(panicMinutesLeft(Number.NaN, now)).toBe(0);
  });

  test("rounds partial minutes up and never goes negative", () => {
    expect(panicMinutesLeft(now + 1, now)).toBe(1);
    expect(panicMinutesLeft(now + 60_000, now)).toBe(1);
    expect(panicMinutesLeft(now + 60_001, now)).toBe(2);
    expect(panicMinutesLeft(now + 30 * 60_000, now)).toBe(30);
    expect(panicMinutesLeft(now - 90_000, now)).toBe(0);
  });
});
