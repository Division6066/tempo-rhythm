import { describe, expect, test } from "bun:test";
import { splitByStatus, validatePhraseText } from "./phraseInput";

describe("validatePhraseText", () => {
  test("empty", () => {
    expect(validatePhraseText("")).toEqual({
      ok: false,
      message: "Write a phrase in your own words.",
    });
    expect(validatePhraseText("   \n\t  ")).toEqual({
      ok: false,
      message: "Write a phrase in your own words.",
    });
  });

  test("too long", () => {
    expect(validatePhraseText(` ${"a".repeat(141)} `)).toEqual({
      ok: false,
      message: "Keep it under 140 characters.",
    });
  });

  test("emoji", () => {
    expect(validatePhraseText("Take the meds 💊")).toEqual({
      ok: false,
      message: "No emoji in nags.",
    });
    expect(validatePhraseText("😀")).toEqual({
      ok: false,
      message: "No emoji in nags.",
    });
  });

  test("ok", () => {
    expect(validatePhraseText("  Meds are on the counter.  ")).toEqual({
      ok: true,
      text: "Meds are on the counter.",
    });
    expect(validatePhraseText("a".repeat(140))).toEqual({
      ok: true,
      text: "a".repeat(140),
    });
  });
});

describe("splitByStatus", () => {
  test("splitByStatus", () => {
    const phrases = [
      { id: "1", text: "Own words", status: "accepted" as const },
      { id: "2", text: "Maybe", status: "proposed" as const },
      { id: "3", text: "No thanks", status: "rejected" as const },
      { id: "4", text: "Also mine", status: "accepted" as const },
    ];
    expect(splitByStatus(phrases)).toEqual({
      accepted: [phrases[0], phrases[3]],
      proposed: [phrases[1]],
      rejected: [phrases[2]],
    });
    expect(splitByStatus([])).toEqual({ accepted: [], proposed: [], rejected: [] });
  });
});
