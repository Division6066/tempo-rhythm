import { describe, expect, test } from "bun:test";
import {
  habitRoutineCopy,
  resolveEnergySuggestion,
  type EnergySuggestion,
} from "../../packages/utils/src/habit-energy-suggestions";

const shameBasedPhrases = [
  /\bbehind\b/i,
  /\bbroken\b/i,
  /\bfailed?\b/i,
  /\bfailing\b/i,
  /\blazy\b/i,
  /\bmust\b/i,
  /\bshould\b/i,
  /\bstreak broken\b/i,
  /\byou missed\b/i,
  /\byou need to\b/i,
  /\bwhat'?s wrong\b/i,
];

function collectCopy(value: unknown, path: string, rows: Array<{ path: string; text: string }>) {
  if (typeof value === "string") {
    rows.push({ path, text: value });
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectCopy(item, `${path}[${index}]`, rows));
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      collectCopy(child, `${path}.${key}`, rows);
    }
  }
}

describe("energy-aware habit suggestions", () => {
  const suggestion: EnergySuggestion = {
    id: "low-energy-water",
    habitName: "Drink water",
    energy: "low",
    title: "Try a gentle water reset",
    body: "A small sip can count. Keep it light.",
  };

  test("accepting a suggestion returns accepted state without mutating the original", () => {
    const suggestions = [suggestion];

    const resolved = resolveEnergySuggestion(suggestions, suggestion.id, "accepted");

    expect(resolved).toEqual([
      {
        ...suggestion,
        status: "accepted",
      },
    ]);
    expect(suggestions).toEqual([suggestion]);
  });

  test("rejecting a suggestion keeps the item visible as rejected without breaking state", () => {
    const suggestions = [{ ...suggestion, status: "pending" as const }];

    const resolved = resolveEnergySuggestion(suggestions, suggestion.id, "rejected");

    expect(resolved[0]).toEqual({
      ...suggestion,
      status: "rejected",
    });
  });

  test("throws a clear error when resolving an unknown suggestion", () => {
    expect(() => resolveEnergySuggestion([suggestion], "missing", "accepted")).toThrow(
      /Suggestion not found/i,
    );
  });
});

describe("habit and routine brand voice", () => {
  test("habit/routine copy avoids shame-based phrasing", () => {
    const rows: Array<{ path: string; text: string }> = [];
    collectCopy(habitRoutineCopy, "habitRoutineCopy", rows);

    expect(rows.length).toBeGreaterThan(0);

    const violations = rows.flatMap(({ path, text }) =>
      shameBasedPhrases
        .filter((phrase) => phrase.test(text))
        .map((phrase) => `${path}: ${phrase} matched "${text}"`),
    );

    expect(violations).toEqual([]);
  });
});
