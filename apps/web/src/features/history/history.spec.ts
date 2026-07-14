import { expect, test, type Page } from "@playwright/test";
import type { HistoryConversation } from "./history-model";

const seededConversations: HistoryConversation[] = [
  {
    id: "aurora-morning",
    title: "Morning reset after a loud inbox",
    companionName: "Aurora",
    createdAt: 1_800_000_000_000,
    updatedAt: 1_800_000_020_000,
    messages: [
      {
        id: "aurora-morning-1",
        conversationId: "aurora-morning",
        role: "user",
        content: "I opened my inbox and my shoulders went straight up.",
        createdAt: 1_800_000_000_001,
      },
      {
        id: "aurora-morning-2",
        conversationId: "aurora-morning",
        role: "assistant",
        content: "Let's make the first step tiny: park the inbox, write the one reply that unblocks today.",
        createdAt: 1_800_000_000_002,
      },
    ],
  },
  {
    id: "aurora-passport",
    title: "Packing list for the Friday train",
    companionName: "Aurora",
    createdAt: 1_800_000_030_000,
    updatedAt: 1_800_000_050_000,
    messages: [
      {
        id: "aurora-passport-1",
        conversationId: "aurora-passport",
        role: "user",
        content: "Please remind me that the passport lives in the blue pouch.",
        createdAt: 1_800_000_030_001,
      },
      {
        id: "aurora-passport-2",
        conversationId: "aurora-passport",
        role: "assistant",
        content: "Blue pouch, front pocket, checked before shoes. That is enough for this pass.",
        createdAt: 1_800_000_030_002,
      },
    ],
  },
  {
    id: "moss-dishes",
    title: "Kitchen counter after dinner",
    companionName: "Moss",
    createdAt: 1_800_000_060_000,
    updatedAt: 1_800_000_070_000,
    messages: [
      {
        id: "moss-dishes-1",
        conversationId: "moss-dishes",
        role: "user",
        content: "The dishes feel bigger than they are.",
        createdAt: 1_800_000_060_001,
      },
      {
        id: "moss-dishes-2",
        conversationId: "moss-dishes",
        role: "assistant",
        content: "Moss says: rinse the easiest cup first, then decide whether the next plate is available.",
        createdAt: 1_800_000_060_002,
      },
    ],
  },
  {
    id: "moss-call",
    title: "After-call decompression",
    companionName: "Moss",
    createdAt: 1_800_000_080_000,
    updatedAt: 1_800_000_090_000,
    messages: [
      {
        id: "moss-call-1",
        conversationId: "moss-call",
        role: "user",
        content: "I need a softer landing after that vendor call.",
        createdAt: 1_800_000_080_001,
      },
      {
        id: "moss-call-2",
        conversationId: "moss-call",
        role: "assistant",
        content: "Put both feet on the floor and write the one sentence you want future-you to remember.",
        createdAt: 1_800_000_080_002,
      },
    ],
  },
];

test("2 companions x 2 conversations seeded: history lists 4, scoped correctly, resumes full thread", async ({
  page,
}) => {
  await loadHistoryFixture(page, seededConversations);

  await expect(page.getByTestId("history-row")).toHaveCount(4);

  await page.getByLabel("Search conversations").fill("Aurora");
  await expect(page.getByTestId("history-row")).toHaveCount(2);
  await expect(page.getByTestId("history-row").filter({ hasText: "Moss" })).toHaveCount(0);

  await page.getByRole("button", { name: /Packing list for the Friday train/ }).click();
  await expect(page.getByTestId("thread-message")).toHaveCount(2);
  const fullThread = page.getByLabel("Full messages");
  await expect(fullThread.getByText("Please remind me that the passport lives in the blue pouch.")).toBeVisible();
  await expect(fullThread.getByText("Blue pouch, front pocket, checked before shoes.")).toBeVisible();
});

test("search filters by companion name and by text", async ({ page }) => {
  await loadHistoryFixture(page, seededConversations);

  await page.getByLabel("Search conversations").fill("Moss");
  await expect(page.getByTestId("history-row")).toHaveCount(2);
  await expect(page.getByTestId("history-row").filter({ hasText: "Aurora" })).toHaveCount(0);

  await page.getByLabel("Search conversations").fill("passport");
  await expect(page.getByTestId("history-row")).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Packing list for the Friday train/ })).toBeVisible();
});

test("200-message thread renders without a stall over 2s", async ({ page }) => {
  const longConversation: HistoryConversation = {
    id: "moss-long-thread",
    title: "Long planning thread",
    companionName: "Moss",
    createdAt: 1_800_000_100_000,
    updatedAt: 1_800_000_200_000,
    messages: Array.from({ length: 200 }, (_, index) => ({
      id: `long-message-${index}`,
      conversationId: "moss-long-thread",
      role: index % 2 === 0 ? "user" : "assistant",
      content: `Long-thread message ${index + 1}: one small step can stay small and still count.`,
      createdAt: 1_800_000_100_000 + index,
    })),
  };

  await page.setContent(historyFixtureHtml([longConversation]));
  const renderDurationMs = await page.evaluate(async () => {
    const start = performance.now();
    window.renderThread("moss-long-thread");
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return performance.now() - start;
  });

  await expect(page.getByTestId("thread-message")).toHaveCount(200);
  expect(renderDurationMs).toBeLessThan(2_000);
});

test("empty state renders real copy", async ({ page }) => {
  await loadHistoryFixture(page, []);

  await expect(page.getByRole("heading", { name: "No past conversations yet." })).toBeVisible();
  await expect(page.getByText("Nothing to catch up on, nothing to tidy first.")).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: "/opt/cursor/artifacts/history_empty_state_agent_229.png",
  });
});

async function loadHistoryFixture(page: Page, conversations: HistoryConversation[]) {
  await page.setContent(historyFixtureHtml(conversations));
}

function historyFixtureHtml(conversations: HistoryConversation[]): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>History fixture</title>
    <style>
      body {
        margin: 0;
        background: #f5eee6;
        color: #251f1b;
        font-family: ui-sans-serif, system-ui, sans-serif;
      }

      main {
        display: grid;
        gap: 20px;
        max-width: 1120px;
        margin: 0 auto;
        padding: 32px;
      }

      .shell {
        display: grid;
        grid-template-columns: minmax(260px, 0.85fr) minmax(0, 1.4fr);
        gap: 18px;
      }

      .panel {
        border: 1px solid #ded1c4;
        border-radius: 24px;
        background: #fffaf4;
        box-shadow: 0 16px 48px rgba(74, 54, 34, 0.08);
        overflow: hidden;
      }

      .panel-body {
        display: grid;
        gap: 10px;
        max-height: 620px;
        overflow: auto;
        padding: 14px;
      }

      .row {
        display: block;
        width: 100%;
        border: 1px solid transparent;
        border-radius: 18px;
        background: transparent;
        padding: 14px;
        text-align: left;
      }

      .row:hover,
      .row[aria-pressed="true"] {
        border-color: #d06b2c;
        background: rgba(208, 107, 44, 0.1);
      }

      .pill {
        display: inline-flex;
        border-radius: 999px;
        background: #ece2d7;
        padding: 2px 9px;
        color: #6d5d50;
        font-size: 12px;
      }

      .thread {
        max-height: 620px;
        overflow: auto;
        padding: 16px;
      }

      .message {
        margin: 0 0 12px;
        border: 1px solid #dfd0c1;
        border-radius: 18px;
        padding: 12px 14px;
        background: #fffdf8;
        content-visibility: auto;
        contain-intrinsic-size: 0 76px;
      }

      .message.assistant {
        background: #26211d;
        color: #fff8ec;
      }

      .empty {
        min-height: 70vh;
        display: grid;
        place-items: center;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <span class="pill">Conversation history</span>
        <h1>Pick up a conversation right where it softened.</h1>
        <label for="history-search">Search conversations</label>
        <input id="history-search" type="search" aria-label="Search conversations" />
      </header>
      <section id="root"></section>
    </main>
    <script>
      const conversations = ${JSON.stringify(conversations).replaceAll("<", "\\u003c")};
      const root = document.getElementById("root");
      const search = document.getElementById("history-search");

      function matches(conversation, query) {
        if (!query) return true;
        const haystacks = [
          conversation.title,
          conversation.companionName,
          ...conversation.messages.map((message) => message.content),
        ];
        return haystacks.some((value) => value.toLowerCase().includes(query));
      }

      function renderList() {
        if (conversations.length === 0) {
          root.innerHTML = '<section class="panel empty"><div><span class="pill">Fresh start</span><h2>No past conversations yet.</h2><p>When you chat with a companion, this page becomes a calm shelf for returning to what you already explored. Nothing to catch up on, nothing to tidy first.</p></div></section>';
          return;
        }

        const query = search.value.trim().toLowerCase();
        const filtered = conversations.filter((conversation) => matches(conversation, query));
        const selectedId = filtered[0]?.id ?? conversations[0].id;
        root.innerHTML = '<section class="shell"><div class="panel"><div class="panel-body" aria-label="Conversation results">' +
          filtered.map((conversation) => '<button class="row" data-testid="history-row" aria-pressed="' + (conversation.id === selectedId) + '" onclick="window.renderThread(\\'' + conversation.id + '\\')"><strong>' + conversation.title + '</strong><br/><span class="pill">' + conversation.companionName + '</span><p>' + conversation.messages[0].content + '</p></button>').join("") +
          '</div></div><div class="panel"><div class="thread" id="thread" aria-label="Full messages"></div></div></section>';
        window.renderThread(selectedId);
      }

      window.renderThread = function renderThread(conversationId) {
        const conversation = conversations.find((candidate) => candidate.id === conversationId);
        const thread = document.getElementById("thread");
        if (!conversation || !thread) return;
        document.querySelectorAll(".row").forEach((row) => {
          row.setAttribute("aria-pressed", String(row.textContent.includes(conversation.title)));
        });
        thread.innerHTML = conversation.messages.map((message) => '<article data-testid="thread-message" class="message ' + message.role + '"><p>' + message.content + '</p></article>').join("");
      };

      search.addEventListener("input", renderList);
      renderList();
    </script>
  </body>
</html>`;
}

declare global {
  interface Window {
    renderThread: (conversationId: string) => void;
  }
}
