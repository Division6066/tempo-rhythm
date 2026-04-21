#!/usr/bin/env bun
/**
 * Playwright demo-capture script.
 *
 * Launches headless Chromium once at each viewport (desktop 1440×900 + mobile
 * 390×844) and iterates the full list of 42 web routes, capturing a full-page
 * PNG for each, then writes a markdown INDEX alongside.
 *
 * Run:
 *   1. NEXT_PUBLIC_DEMO_MODE=1 bun run --filter tempo-rhythm-web dev   # in another terminal
 *   2. bun scripts/demo/playwright-demo-capture.ts
 *
 * Output:
 *   docs/design/demo-evidence/web-desktop/<slug>.png
 *   docs/design/demo-evidence/web-mobile/<slug>.png
 *   docs/design/demo-evidence/INDEX.md
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, type Browser, type BrowserContext } from "playwright";

type Route = { slug: string; path: string; category: string };

// Mirrors apps/web/lib/tempo-nav.ts + bare/marketing routes.
const ROUTES: Route[] = [
  // Marketing
  { slug: "landing", path: "/", category: "Marketing" },
  { slug: "about", path: "/about", category: "Marketing" },
  { slug: "changelog", path: "/changelog", category: "Marketing" },
  // Auth / onboarding
  { slug: "sign-in", path: "/sign-in", category: "Onboarding" },
  { slug: "onboarding", path: "/onboarding", category: "Onboarding" },
  // Flow
  { slug: "today", path: "/today", category: "Flow" },
  { slug: "daily-note", path: "/daily-note", category: "Flow" },
  { slug: "brain-dump", path: "/brain-dump", category: "Flow" },
  { slug: "coach", path: "/coach", category: "Flow" },
  { slug: "plan", path: "/plan", category: "Flow" },
  // Library
  { slug: "tasks", path: "/tasks", category: "Library" },
  { slug: "notes", path: "/notes", category: "Library" },
  { slug: "note-detail", path: "/notes/note_launch_copy", category: "Library" },
  { slug: "journal", path: "/journal", category: "Library" },
  { slug: "calendar", path: "/calendar", category: "Library" },
  { slug: "habits", path: "/habits", category: "Library" },
  { slug: "habit-detail", path: "/habits/habit_meds", category: "Library" },
  { slug: "routines", path: "/routines", category: "Library" },
  { slug: "routine-detail", path: "/routines/routine_startup", category: "Library" },
  { slug: "goals", path: "/goals", category: "Library" },
  { slug: "goal-detail", path: "/goals/goal_launch", category: "Library" },
  { slug: "goals-progress", path: "/goals/progress", category: "Library" },
  { slug: "projects", path: "/projects", category: "Library" },
  { slug: "project-detail", path: "/projects/project_tempo", category: "Library" },
  { slug: "project-kanban", path: "/projects/project_tempo/kanban", category: "Library" },
  // You
  { slug: "analytics", path: "/insights", category: "You" },
  { slug: "activity", path: "/activity", category: "You" },
  { slug: "templates", path: "/templates", category: "You" },
  { slug: "template-builder", path: "/templates/builder", category: "You" },
  { slug: "template-run", path: "/templates/run/tpl_weekly_review", category: "You" },
  { slug: "template-editor", path: "/templates/editor/tpl_weekly_review", category: "You" },
  { slug: "template-sketch", path: "/templates/sketch", category: "You" },
  { slug: "search", path: "/search", category: "You" },
  { slug: "command", path: "/command", category: "You" },
  { slug: "empty-states", path: "/empty-states", category: "You" },
  // Settings
  { slug: "settings", path: "/settings/profile", category: "Settings" },
  { slug: "settings-prefs", path: "/settings/preferences", category: "Settings" },
  { slug: "settings-integrations", path: "/settings/integrations", category: "Settings" },
  { slug: "billing", path: "/billing", category: "Settings" },
  { slug: "trial-end", path: "/billing/trial-end", category: "Settings" },
  { slug: "notifications", path: "/notifications", category: "Settings" },
  { slug: "ask-founder", path: "/ask-founder", category: "Settings" },
];

const BASE_URL = process.env.DEMO_BASE_URL ?? "http://127.0.0.1:3000";
const ROOT = resolve("docs/design/demo-evidence");
const DESKTOP_DIR = resolve(ROOT, "web-desktop");
const MOBILE_DIR = resolve(ROOT, "web-mobile");

mkdirSync(DESKTOP_DIR, { recursive: true });
mkdirSync(MOBILE_DIR, { recursive: true });

type Result = {
  slug: string;
  path: string;
  category: string;
  desktopStatus: number | null;
  mobileStatus: number | null;
  desktopError?: string;
  mobileError?: string;
};

async function captureRoute(
  context: BrowserContext,
  outDir: string,
  route: Route,
): Promise<{ status: number | null; error?: string }> {
  const page = await context.newPage();
  try {
    const response = await page.goto(`${BASE_URL}${route.path}`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    await page.waitForTimeout(700);
    await page.screenshot({
      path: resolve(outDir, `${route.slug}.png`),
      fullPage: true,
    });
    return { status: response?.status() ?? null };
  } catch (error) {
    return {
      status: null,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await page.close();
  }
}

async function captureAll(
  browser: Browser,
  variant: "desktop" | "mobile",
  outDir: string,
): Promise<Map<string, { status: number | null; error?: string }>> {
  const viewport =
    variant === "desktop"
      ? { width: 1440, height: 900 }
      : { width: 390, height: 844 };
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    userAgent:
      variant === "desktop"
        ? undefined
        : "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  const results = new Map<string, { status: number | null; error?: string }>();
  for (const route of ROUTES) {
    const res = await captureRoute(context, outDir, route);
    results.set(route.slug, res);
    console.log(
      `  ${variant.padEnd(7)} ${route.slug.padEnd(24)} ${res.status ?? "err"}${res.error ? ` (${res.error.slice(0, 60)})` : ""}`,
    );
  }
  await context.close();
  return results;
}

async function main(): Promise<void> {
  console.log(`Launching Chromium, capturing ${ROUTES.length} routes × 2 viewports…`);
  const browser = await chromium.launch();
  try {
    const desktopResults = await captureAll(browser, "desktop", DESKTOP_DIR);
    const mobileResults = await captureAll(browser, "mobile", MOBILE_DIR);

    const results: Result[] = ROUTES.map((route) => {
      const d = desktopResults.get(route.slug);
      const m = mobileResults.get(route.slug);
      return {
        slug: route.slug,
        path: route.path,
        category: route.category,
        desktopStatus: d?.status ?? null,
        mobileStatus: m?.status ?? null,
        desktopError: d?.error,
        mobileError: m?.error,
      };
    });

    const lines: string[] = [];
    lines.push("# Tempo Flow demo-evidence index");
    lines.push("");
    lines.push(
      `Generated by \`scripts/demo/playwright-demo-capture.ts\` on ${new Date().toISOString()}.`,
    );
    lines.push("");
    lines.push(`Base URL: \`${BASE_URL}\``);
    lines.push("");
    lines.push("| slug | category | path | desktop | mobile | notes |");
    lines.push("|---|---|---|---|---|---|");
    for (const r of results) {
      const notes = [
        r.desktopError ? `desktop error: ${r.desktopError.slice(0, 80)}` : null,
        r.mobileError ? `mobile error: ${r.mobileError.slice(0, 80)}` : null,
      ]
        .filter(Boolean)
        .join("; ");
      lines.push(
        `| \`${r.slug}\` | ${r.category} | \`${r.path}\` | ${r.desktopStatus ?? "—"} | ${r.mobileStatus ?? "—"} | ${notes || "—"} |`,
      );
    }
    lines.push("");
    lines.push("## Mobile / Expo note");
    lines.push("");
    lines.push(
      "The React Native surface (12 screens) is not captured by this script — it requires a running Expo Go or emulator session. See `docs/design/expo-go-handoff.md` for the Expo path.",
    );
    lines.push(
      "Mobile-web viewport PNGs above use Safari UA + 390×844 on the Next.js PWA to approximate on-device framing.",
    );

    writeFileSync(resolve(ROOT, "INDEX.md"), `${lines.join("\n")}\n`);

    const ok = results.filter(
      (r) =>
        (r.desktopStatus ?? 0) >= 200 &&
        (r.desktopStatus ?? 0) < 400 &&
        (r.mobileStatus ?? 0) >= 200 &&
        (r.mobileStatus ?? 0) < 400,
    ).length;
    console.log(`\nCaptured ${results.length} routes (${ok} fully-ok).`);
  } finally {
    await browser.close();
  }
}

await main();
