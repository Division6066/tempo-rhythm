import { describe, expect, test } from "bun:test";
import { coachReplyForTechnique } from "./coach";

const KNOWN_TECHNIQUES = [
  "pomodoro",
  "body_double",
  "eat_the_frog",
  "time_blocking",
  "two_minute",
  "general",
] as const;

/** Hebrew block — the old replies were hardcoded Hebrew; English-first is the contract now. */
const HEBREW_CODEPOINTS = /[\u0590-\u05FF]/;

/** HARD_RULES §1 — copy must never imply failure or laziness. */
const SHAME_WORDS = /\b(behind|failing|failure|lazy|laziness|streak broken|overdue)\b/i;

describe("coachReplyForTechnique", () => {
  test.each([...KNOWN_TECHNIQUES])("returns a non-empty English reply for %s", (technique) => {
    const reply = coachReplyForTechnique(technique);
    expect(reply.trim().length).toBeGreaterThan(0);
    expect(reply).not.toMatch(HEBREW_CODEPOINTS);
  });

  test("each known technique has its own distinct reply", () => {
    const replies = KNOWN_TECHNIQUES.map((technique) => coachReplyForTechnique(technique));
    expect(new Set(replies).size).toBe(KNOWN_TECHNIQUES.length);
  });

  test("falls back to the general reply for an unknown technique", () => {
    expect(coachReplyForTechnique("swiss_cheese")).toBe(coachReplyForTechnique("general"));
  });

  test("falls back to the general reply when technique is undefined", () => {
    expect(coachReplyForTechnique(undefined)).toBe(coachReplyForTechnique("general"));
  });

  test("does not resolve replies from Object.prototype keys", () => {
    expect(coachReplyForTechnique("toString")).toBe(coachReplyForTechnique("general"));
    expect(coachReplyForTechnique("constructor")).toBe(coachReplyForTechnique("general"));
  });

  test.each([...KNOWN_TECHNIQUES])("reply for %s carries no shame language", (technique) => {
    expect(coachReplyForTechnique(technique)).not.toMatch(SHAME_WORDS);
  });
});
