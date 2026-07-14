import { expect, test, type Page } from '@playwright/test';

const activeSessionStorageKey = 'theway.sessionPlayer.active.v1';
const sessionLogStorageKey = 'theway.sessionPlayer.log.v1';
const elapsedSelector = '[data-testid="session-player-elapsed"]';
const isPlaywrightRunner = process.argv.some((arg) =>
  arg.includes('playwright')
);

async function readElapsedSeconds(page: Page): Promise<number> {
  const text = await page.getByTestId('session-player-elapsed').innerText();
  const match = text.match(/([0-9]+\.[0-9])s/);
  if (!match?.[1]) {
    throw new Error(`Could not parse elapsed time from: ${text}`);
  }

  return Number(match[1]);
}

async function setVisibility(page: Page, visibilityState: 'hidden' | 'visible') {
  await page.evaluate((nextVisibilityState) => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: nextVisibilityState,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  }, visibilityState);
}

if (isPlaywrightRunner) {
  test('plays seeded routine end to end with pause, resume, background resume, and session log', async ({
    page,
  }) => {
    await page.addInitScript(
      ([activeKey, logKey]) => {
        window.localStorage.removeItem(activeKey);
        window.localStorage.removeItem(logKey);
      },
      [activeSessionStorageKey, sessionLogStorageKey]
    );

    await page.goto('/routines');
    await expect(page.getByTestId('session-player-screen')).toBeVisible();
    await expect(page.getByTestId('session-log-empty')).toBeVisible();

    await page.getByTestId('session-player-start-routine').click();
    await expect(page.getByTestId('session-player-status')).toContainText(
      'running'
    );

    await page.waitForFunction((selector) => {
      const text = document.querySelector(selector)?.textContent ?? '';
      const match = text.match(/([0-9]+\.[0-9])s/);
      return match?.[1] ? Number(match[1]) >= 0.4 : false;
    }, elapsedSelector);

    await page.getByTestId('session-player-pause').click();
    await expect(page.getByTestId('session-player-status')).toContainText(
      'paused'
    );
    const pausedElapsed = await readElapsedSeconds(page);

    await page.waitForTimeout(600);
    expect(await readElapsedSeconds(page)).toBe(pausedElapsed);

    await page.getByTestId('session-player-resume').click();
    await expect(page.getByTestId('session-player-status')).toContainText(
      'running'
    );
    await page.waitForFunction(
      ([selector, frozenElapsed]) => {
        const text = document.querySelector(selector)?.textContent ?? '';
        const match = text.match(/([0-9]+\.[0-9])s/);
        return match?.[1] ? Number(match[1]) > frozenElapsed : false;
      },
      [elapsedSelector, pausedElapsed]
    );

    await setVisibility(page, 'hidden');
    await expect(
      page.getByTestId('session-player-background-state')
    ).toContainText('Saved while backgrounded');
    const hiddenElapsed = await readElapsedSeconds(page);
    await page.waitForTimeout(600);
    expect(await readElapsedSeconds(page)).toBe(hiddenElapsed);

    await setVisibility(page, 'visible');
    await expect(
      page.getByTestId('session-player-background-state')
    ).toContainText('Resumed correctly after background');
    await page.waitForFunction(
      ([selector, frozenElapsed]) => {
        const text = document.querySelector(selector)?.textContent ?? '';
        const match = text.match(/([0-9]+\.[0-9])s/);
        return match?.[1] ? Number(match[1]) > frozenElapsed : false;
      },
      [elapsedSelector, hiddenElapsed]
    );

    await expect(page.getByTestId('session-player-status')).toContainText(
      'finished',
      { timeout: 6000 }
    );
    await expect(page.getByTestId('session-log-row')).toContainText(
      'seed-morning-reset'
    );

    const logPayload = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      sessionLogStorageKey
    );
    expect(logPayload).toContain('"routineId":"seed-morning-reset"');
  });
}
