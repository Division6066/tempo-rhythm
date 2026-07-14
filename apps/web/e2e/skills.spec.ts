import { mkdirSync } from "node:fs";
import path from "node:path";
import { spawn, type ChildProcess } from "node:child_process";
import { expect, test } from "@playwright/test";

const port = 3107;
const baseUrl = `http://127.0.0.1:${port}`;
const screenshotPath = path.join(
  process.cwd(),
  "apps/web/e2e/skill-library-grid.png",
);

type SkillFixture = {
  id: string;
  name: string;
  summary: string;
  author: string;
  tags: string[];
};

const skillFixtures: SkillFixture[] = [
  {
    id: "focus-sprint",
    name: "Focus sprint",
    summary: "Creates a gentle 25 minute sprint with a soft landing.",
    author: "Tempo Labs",
    tags: ["planning", "focus"],
  },
  {
    id: "calendar-bridge",
    name: "Calendar bridge",
    summary: "Suggests calendar holds after you approve each candidate.",
    author: "Tempo Labs",
    tags: ["calendar", "planning"],
  },
  {
    id: "inbox-scanner",
    name: "Inbox scanner",
    summary: "Reads an export in memory and proposes possible tasks.",
    author: "Agentwright community",
    tags: ["scanner", "tasks"],
  },
  {
    id: "shell-runner",
    name: "Shell runner",
    summary: "Runs local shell commands from natural language prompts.",
    author: "Unknown publisher",
    tags: ["automation", "shell"],
  },
];

const scanFixtures = [
  {
    skillId: "focus-sprint",
    verdict: "allow",
    summary: "No risky permissions found.",
    findings: [],
  },
  {
    skillId: "calendar-bridge",
    verdict: "allow",
    summary: "Uses calendar proposal scopes only.",
    findings: [],
  },
  {
    skillId: "inbox-scanner",
    verdict: "warn",
    summary: "Medium risk: asks to scan imported message text.",
    findings: [
      "Processes imported message bodies during scan",
      "Requests read access to local export files",
    ],
  },
  {
    skillId: "shell-runner",
    verdict: "block",
    summary: "Blocked: command execution permission is not allowed.",
    findings: [
      "Requests unrestricted shell execution",
      "Publisher identity is not verified",
    ],
  },
] as const;

let server: ChildProcess | undefined;

async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 60_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok || response.status === 404) {
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${baseUrl}: ${String(lastError)}`);
}

test.beforeAll(async () => {
  server = spawn("bun", ["run", "dev"], {
    cwd: path.join(process.cwd(), "apps/web"),
    env: {
      ...process.env,
      NEXT_PUBLIC_CONVEX_URL: "https://skill-library-test.convex.cloud",
      NEXT_TELEMETRY_DISABLED: "1",
      PORT: String(port),
    },
    stdio: "pipe",
  });

  server.stdout?.on("data", (chunk) => {
    process.stdout.write(`[next] ${chunk}`);
  });
  server.stderr?.on("data", (chunk) => {
    process.stderr.write(`[next] ${chunk}`);
  });

  await waitForServer();
});

test.afterAll(() => {
  if (server?.pid) {
    server.kill("SIGTERM");
  }
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({ skills, scans }) => {
      const messages: unknown[] = [];
      Object.defineProperty(window, "__skillDaemonMessages", {
        configurable: true,
        value: messages,
      });

      class MockSkillDaemonSocket extends EventTarget {
        static CONNECTING = 0;
        static OPEN = 1;
        static CLOSING = 2;
        static CLOSED = 3;

        readonly url: string;
        readyState = MockSkillDaemonSocket.CONNECTING;
        onopen: ((event: Event) => void) | null = null;
        onmessage: ((event: MessageEvent) => void) | null = null;
        onerror: ((event: Event) => void) | null = null;
        onclose: ((event: CloseEvent) => void) | null = null;

        constructor(url: string) {
          super();
          this.url = url;
          setTimeout(() => {
            this.readyState = MockSkillDaemonSocket.OPEN;
            const event = new Event("open");
            this.dispatchEvent(event);
            this.onopen?.(event);
          }, 0);
        }

        send(raw: string) {
          const request = JSON.parse(raw);
          messages.push(request);

          const respond = (result: unknown) => {
            const event = new MessageEvent("message", {
              data: JSON.stringify({ id: request.id, result }),
            });
            this.dispatchEvent(event);
            this.onmessage?.(event);
          };

          if (request.method === "skills.list") {
            respond(skills);
            return;
          }

          if (request.method === "skills.search") {
            const query = String(request.params?.query ?? "").toLowerCase();
            respond(
              skills.filter((skill) => {
                const haystack = [
                  skill.name,
                  skill.summary,
                  skill.author,
                  ...skill.tags,
                ]
                  .join(" ")
                  .toLowerCase();
                return haystack.includes(query);
              }),
            );
            return;
          }

          if (request.method === "skillScans") {
            respond(scans);
            return;
          }

          if (request.method === "skill_install") {
            respond({ installed: true, skillId: request.params?.skillId });
            return;
          }

          respond(null);
        }

        close() {
          this.readyState = MockSkillDaemonSocket.CLOSED;
          const event = new CloseEvent("close");
          this.dispatchEvent(event);
          this.onclose?.(event);
        }
      }

      Object.defineProperty(window, "WebSocket", {
        configurable: true,
        value: MockSkillDaemonSocket,
      });
    },
    { skills: skillFixtures, scans: scanFixtures },
  );
});

test("search narrows the skill library grid and captures the committed screenshot", async ({
  page,
}) => {
  await page.goto(`${baseUrl}/skills`);

  await expect(page.getByRole("heading", { name: "Skill library" })).toBeVisible();
  await expect(page.getByTestId("skill-card")).toHaveCount(4);

  mkdirSync(path.dirname(screenshotPath), { recursive: true });
  await page.getByTestId("skill-grid").screenshot({ path: screenshotPath });

  await page.getByLabel("Search skills").fill("calendar");

  await expect(page.getByTestId("skill-card")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Calendar bridge" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Focus sprint" })).toBeHidden();

  await expect
    .poll(async () =>
      page.evaluate(() =>
        (window as unknown as { __skillDaemonMessages: Array<{ method: string }> })
          .__skillDaemonMessages.some((message) => message.method === "skills.search"),
      ),
    )
    .toBe(true);
});

test("warn skill installs only after the consent dialog is confirmed", async ({
  page,
}) => {
  await page.goto(`${baseUrl}/skills`);

  const warnCard = page.getByTestId("skill-card-inbox-scanner");
  await warnCard.getByRole("button", { name: "Review & install Inbox scanner" }).click();

  await expect(page.getByRole("dialog", { name: "Review Inbox scanner" })).toBeVisible();
  await expect(page.getByText("Processes imported message bodies during scan")).toBeVisible();
  await expect(page.getByText("Requests read access to local export files")).toBeVisible();

  await expect
    .poll(async () =>
      page.evaluate(() =>
        (window as unknown as { __skillDaemonMessages: Array<{ method: string }> })
          .__skillDaemonMessages.filter((message) => message.method === "skill_install")
          .length,
      ),
    )
    .toBe(0);

  await page.getByRole("button", { name: "Confirm install" }).click();

  await expect(page.getByText("Inbox scanner installed.")).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() =>
        (window as unknown as { __skillDaemonMessages: Array<{ method: string }> })
          .__skillDaemonMessages.some(
            (message) =>
              message.method === "skill_install" &&
              (message as { params?: { skillId?: string } }).params?.skillId ===
                "inbox-scanner",
          ),
      ),
    )
    .toBe(true);
});

test("block skill install is disabled and the verdict is shown", async ({ page }) => {
  await page.goto(`${baseUrl}/skills`);

  const blockCard = page.getByTestId("skill-card-shell-runner");
  await expect(blockCard.getByText("Blocked")).toBeVisible();
  await expect(
    blockCard.getByText("Blocked: command execution permission is not allowed."),
  ).toBeVisible();
  await expect(
    blockCard.getByRole("button", { name: "Shell runner blocked" }),
  ).toBeDisabled();
});
