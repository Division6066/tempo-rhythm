import { type ChildProcess, spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const port = 3117;
const daemonPort = 3210;
const baseUrl = `http://localhost:${port}`;
const screenshotPath = path.join(process.cwd(), "apps/web/e2e/skill-library-grid.png");
const daemonLogPath = path.join(process.cwd(), "apps/web/e2e/.skills-daemon-log");

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
    findings: ["Requests unrestricted shell execution", "Publisher identity is not verified"],
  },
] as const;

let server: ChildProcess | undefined;
let daemon: ChildProcess | undefined;

test.describe.configure({ mode: "serial" });

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

async function waitForDaemon(): Promise<void> {
  const deadline = Date.now() + 10_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${daemonPort}`);
      if (response.ok) {
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Timed out waiting for daemon: ${String(lastError)}`);
}

function readDaemonMessages(): Array<{
  method: string;
  params?: { skillId?: string; query?: string };
}> {
  try {
    const contents = readFileSync(daemonLogPath, "utf8").trim();
    if (!contents) return [];
    return contents.split("\n").map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

test.beforeAll(async () => {
  writeFileSync(daemonLogPath, "");

  daemon = spawn(
    "bun",
    [
      "--eval",
      `
const { appendFileSync } = require("node:fs");
const skills = JSON.parse(process.env.SKILLS_FIXTURE);
const scans = JSON.parse(process.env.SCANS_FIXTURE);
const logPath = process.env.DAEMON_LOG_PATH;
const port = Number(process.env.DAEMON_PORT);

Bun.serve({
  port,
  fetch(request, server) {
    if (server.upgrade(request)) return;
    return new Response("ok");
  },
  websocket: {
    message(ws, raw) {
      const request = JSON.parse(String(raw));
      appendFileSync(logPath, JSON.stringify(request) + "\\n");

      const respond = (result) => {
        ws.send(JSON.stringify({ id: request.id, result }));
      };

      if (request.method === "skills.list") {
        respond(skills);
        return;
      }

      if (request.method === "skills.search") {
        const query = String(request.params?.query ?? "").toLowerCase();
        respond(
          skills.filter((skill) =>
            [skill.name, skill.summary, skill.author, ...skill.tags]
              .join(" ")
              .toLowerCase()
              .includes(query),
          ),
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
    },
  },
});

console.log("skill-daemon-ready");
`,
    ],
    {
      env: {
        ...process.env,
        DAEMON_LOG_PATH: daemonLogPath,
        DAEMON_PORT: String(daemonPort),
        SCANS_FIXTURE: JSON.stringify(scanFixtures),
        SKILLS_FIXTURE: JSON.stringify(skillFixtures),
      },
      stdio: "pipe",
    }
  );

  daemon.stdout?.on("data", (chunk) => {
    process.stdout.write(`[daemon] ${chunk}`);
  });
  daemon.stderr?.on("data", (chunk) => {
    process.stderr.write(`[daemon] ${chunk}`);
  });

  await waitForDaemon();

  server = spawn("bun", ["run", "dev"], {
    cwd: path.join(process.cwd(), "apps/web"),
    env: {
      ...process.env,
      NEXT_PUBLIC_AGENTWRIGHT_DAEMON_WS: `ws://127.0.0.1:${daemonPort}`,
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
  if (daemon?.pid) {
    daemon.kill("SIGTERM");
  }
});

test.beforeEach(() => {
  writeFileSync(daemonLogPath, "");
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
    .poll(async () => readDaemonMessages().some((message) => message.method === "skills.search"))
    .toBe(true);
});

test("warn skill installs only after the consent dialog is confirmed", async ({ page }) => {
  await page.goto(`${baseUrl}/skills`);

  const warnCard = page.getByTestId("skill-card-inbox-scanner");
  await warnCard.getByRole("button", { name: "Review & install Inbox scanner" }).click();

  await expect(page.getByRole("dialog", { name: "Review Inbox scanner" })).toBeVisible();
  await expect(page.getByText("Processes imported message bodies during scan")).toBeVisible();
  await expect(page.getByText("Requests read access to local export files")).toBeVisible();

  await expect
    .poll(
      async () =>
        readDaemonMessages().filter((message) => message.method === "skill_install").length
    )
    .toBe(0);

  await page.getByRole("button", { name: "Confirm install" }).click();

  await expect(page.getByText("Inbox scanner installed.")).toBeVisible();
  await expect(warnCard.getByText("Installed", { exact: true })).toBeVisible();
  await expect(
    warnCard.getByRole("button", { name: "Inbox scanner installed" }),
  ).toBeDisabled();
  await expect
    .poll(async () =>
      readDaemonMessages().some(
        (message) =>
          message.method === "skill_install" && message.params?.skillId === "inbox-scanner"
      )
    )
    .toBe(true);
});

test("block skill install is disabled and the verdict is shown", async ({ page }) => {
  await page.goto(`${baseUrl}/skills`);

  const blockCard = page.getByTestId("skill-card-shell-runner");
  await expect(blockCard.getByText("Blocked", { exact: true })).toBeVisible();
  await expect(
    blockCard.getByText("Blocked: command execution permission is not allowed.")
  ).toBeVisible();
  await expect(blockCard.getByRole("button", { name: "Shell runner blocked" })).toBeDisabled();
});
