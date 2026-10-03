import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import {
  companionNameFromTechnique,
  filterHistoryConversations,
  getConversationPreview,
  isLiveConversation,
  type HistoryConversation,
} from "./conversationHistory";

function thread(
  overrides: Partial<HistoryConversation> = {},
): HistoryConversation {
  return {
    id: "c1",
    title: "Morning reset",
    companionName: "Body Double",
    createdAt: 1,
    updatedAt: 2,
    messages: [
      {
        id: "m1",
        conversationId: "c1",
        role: "user",
        content: "Help me start the laundry.",
        createdAt: 1,
      },
    ],
    ...overrides,
  };
}

describe("companionNameFromTechnique", () => {
  test("titles a missing technique as Tempo companion", () => {
    expect(companionNameFromTechnique(undefined)).toBe("Tempo companion");
  });

  test("title-cases hyphenated techniques", () => {
    expect(companionNameFromTechnique("body_double")).toBe("Body Double");
    expect(companionNameFromTechnique("eat-the-frog")).toBe("Eat The Frog");
  });
});

describe("filterHistoryConversations", () => {
  test("empty query returns every thread with zero message matches", () => {
    const rows = filterHistoryConversations([thread()], "");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.matchingMessageCount).toBe(0);
  });

  test("matches title or companion without needing message text", () => {
    const rows = [thread(), thread({ id: "c2", title: "Taxes", companionName: "Pomodoro" })];
    expect(filterHistoryConversations(rows, "body").map((row) => row.id)).toEqual(["c1"]);
    expect(filterHistoryConversations(rows, "tax").map((row) => row.id)).toEqual(["c2"]);
  });

  test("counts message hits when messages are attached", () => {
    const rows = filterHistoryConversations([thread()], "laundry");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.matchingMessageCount).toBe(1);
  });
});

describe("getConversationPreview", () => {
  test("uses the first non-system message and truncates", () => {
    expect(
      getConversationPreview([
        { id: "s", conversationId: "c1", role: "system", content: "hidden", createdAt: 0 },
        {
          id: "u",
          conversationId: "c1",
          role: "user",
          content: "x".repeat(200),
          createdAt: 1,
        },
      ]),
    ).toHaveLength(140);
  });

  test("empty threads get a gentle preview", () => {
    expect(getConversationPreview([])).toMatch(/no messages/i);
  });
});

describe("isLiveConversation", () => {
  test("soft-deleted rows are hidden", () => {
    expect(isLiveConversation({})).toBe(true);
    expect(isLiveConversation({ deletedAt: 9 })).toBe(false);
  });
});

describe("HistoryScreen leftover wiring", () => {
  test("uses landed conversation and message list APIs", () => {
    const source = readFileSync(
      join(import.meta.dir, "../components/history/HistoryScreen.tsx"),
      "utf8",
    );
    expect(source).toContain("api.conversations.list");
    expect(source).toContain("api.conversations.get");
    expect(source).toContain("api.messages.list");
    expect(source).toContain("filterHistoryConversations");
    expect(source).not.toContain("convex.query");
  });
});
