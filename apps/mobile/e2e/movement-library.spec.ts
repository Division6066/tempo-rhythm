// @ts-nocheck
import { spawn } from 'node:child_process';
import { expect, test } from 'playwright/test';

const port = 19_107;
const baseUrl = `http://127.0.0.1:${port}`;
const routinesUrl = `${baseUrl}/routines`;
const convexUrl = 'https://example.convex.cloud';

let mobileServer: ReturnType<typeof spawn> | undefined;
let serverOutput = '';

test.describe('Movement library', () => {
  test.beforeAll(async () => {
    mobileServer = spawn('bun', ['run', 'web', '--', '--port', String(port)], {
      cwd: 'apps/mobile',
      env: {
        ...process.env,
        CI: '1',
        EXPO_PUBLIC_CONVEX_URL: convexUrl,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    mobileServer.stdout?.on('data', (chunk) => {
      serverOutput += chunk.toString();
    });
    mobileServer.stderr?.on('data', (chunk) => {
      serverOutput += chunk.toString();
    });

    await waitForServer(routinesUrl);
  });

  test.afterAll(() => {
    if (mobileServer && !mobileServer.killed) {
      mobileServer.kill('SIGTERM');
    }
  });

  test('RTL category and routine list renders correctly in Hebrew', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      document.documentElement.setAttribute('dir', 'rtl');
      document.body.setAttribute('dir', 'rtl');
    });

    await page.goto(routinesUrl, { waitUntil: 'networkidle' });

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByTestId('movement-library-list')).toBeVisible();
    await expect(page.getByTestId('movement-library-eyebrow')).toHaveText(
      'ספריית תנועה'
    );

    const titleAlign = await page
      .getByTestId('movement-library-title')
      .evaluate((element) => getComputedStyle(element).textAlign);
    expect(titleAlign).toBe('right');

    await expect(page.getByTestId('category-breath')).toContainText('נשימה');
    await expect(page.getByTestId('routine-box-breathing')).toContainText(
      'נשימת קופסה'
    );

    const breathBox = await page.getByTestId('category-breath').boundingBox();
    const mobilityBox = await page
      .getByTestId('category-mobility')
      .boundingBox();
    expect(breathBox).not.toBeNull();
    expect(mobilityBox).not.toBeNull();
    expect(breathBox.x).toBeGreaterThan(mobilityBox.x);

    const copyBox = await page
      .getByTestId('routine-copy-box-breathing')
      .boundingBox();
    const metaBox = await page
      .getByTestId('routine-meta-box-breathing')
      .boundingBox();
    expect(copyBox).not.toBeNull();
    expect(metaBox).not.toBeNull();
    expect(copyBox.x).toBeGreaterThan(metaBox.x);
  });
});

async function waitForServer(url: string): Promise<void> {
  const startedAt = Date.now();
  const timeoutMs = 90_000;

  while (Date.now() - startedAt < timeoutMs) {
    if (mobileServer?.exitCode !== null) {
      throw new Error(
        `Mobile web server exited with ${mobileServer?.exitCode}\n${serverOutput}`
      );
    }

    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until Metro finishes compiling the route.
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Timed out waiting for ${url}\n${serverOutput}`);
}
