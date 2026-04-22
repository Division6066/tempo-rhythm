#!/usr/bin/env node
// Mobile-viewport audit of the live /today loop.
// Run AFTER a web dev server is up at http://localhost:3000 and Convex at :3210.
// Saves screenshots to /tmp/mobile_audit/.

import { mkdirSync } from "node:fs";
import { chromium, devices } from "playwright";

const BASE = process.env.AUDIT_BASE ?? "http://localhost:3000";
const OUT = "/tmp/mobile_audit";
mkdirSync(OUT, { recursive: true });

const email = `audit+${Date.now()}@example.com`;
const password = "Tempo!Flow-0007";

async function shot(page, name) {
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`saved ${name}.png`);
}

const iphone = devices["iPhone 14 Pro"] ?? {
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
};

const browser = await chromium.launch();
const context = await browser.newContext(iphone);
const page = await context.newPage();

try {
  // Landing — signed out
  await page.goto(`${BASE}/`);
  await shot(page, "01-landing-signed-out");

  // Sign-in
  await page.goto(`${BASE}/sign-in`);
  await shot(page, "02-sign-in");

  // Sign-up
  await page.goto(`${BASE}/sign-up`);
  await shot(page, "03-sign-up");

  // Create an account
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  // Accept terms if present
  const consentBtn = page.locator('button[aria-label*="Accept terms"], button[aria-label*="Consent"]').first();
  if (await consentBtn.count()) await consentBtn.click();
  const submit = page.locator('button[type="submit"]').first();
  await submit.click();

  // Wait for /today
  await page.waitForURL(/\/today$/, { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(1_500);
  await shot(page, "04-today-signed-in");

  // Open mobile nav to screenshot the drawer
  const menuBtn = page.getByLabel("Open navigation").first();
  if (await menuBtn.count()) {
    await menuBtn.click();
    await page.waitForTimeout(400);
    await shot(page, "05-today-mobile-nav-open");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
  }

  // Quick-add a task
  const quickAdd = page.locator('#today-quick-add');
  if (await quickAdd.count()) {
    await quickAdd.fill("Audit task one");
    await page.getByRole("button", { name: /add/i }).first().click();
    await page.waitForTimeout(1_000);
    await quickAdd.fill("Audit task two");
    await page.getByRole("button", { name: /add/i }).first().click();
    await page.waitForTimeout(1_000);
    await shot(page, "06-today-with-tasks");
  }

  // Tasks
  await page.goto(`${BASE}/tasks`);
  await page.waitForTimeout(1_500);
  await shot(page, "07-tasks");

  // Notes
  await page.goto(`${BASE}/notes`);
  await page.waitForTimeout(1_000);
  await shot(page, "08-notes-empty");

  // Brain dump
  await page.goto(`${BASE}/brain-dump`);
  await page.waitForTimeout(1_000);
  await shot(page, "09-brain-dump");

  // Journal
  await page.goto(`${BASE}/journal`);
  await page.waitForTimeout(1_000);
  await shot(page, "10-journal");

  // Coach
  await page.goto(`${BASE}/coach`);
  await page.waitForTimeout(1_000);
  await shot(page, "11-coach");

  console.log("audit done");
} catch (err) {
  console.error("audit failed:", err);
  await shot(page, "zz-failure");
  process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
