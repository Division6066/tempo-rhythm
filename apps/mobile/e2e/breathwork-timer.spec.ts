import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

const harnessHtml = `
  <main aria-label="4-7-8 breath timer">
    <h1>4-7-8 breath</h1>
    <section data-testid="breathwork-timer" role="timer">
      <p data-testid="phase-label"></p>
      <p data-testid="elapsed-ms"></p>
      <p data-testid="seconds-remaining"></p>
      <p data-testid="cycle-label"></p>
    </section>
  </main>
`;

let browserEntryPath = '';

test.beforeAll(() => {
  const outdir = mkdtempSync(join(tmpdir(), 'breathwork-e2e-'));

  execFileSync(
    'bun',
    [
      'build',
      'apps/mobile/e2e/breathwork-timer-browser-entry.ts',
      '--format=esm',
      '--target=browser',
      '--outfile',
      join(outdir, 'breathwork-timer-browser-entry.js'),
    ],
    { cwd: join(__dirname, '../../..'), stdio: 'inherit' }
  );

  browserEntryPath = join(outdir, 'breathwork-timer-browser-entry.js');
});

test.describe('4-7-8 breathwork timer', () => {
  test('4-7-8 pattern times phases exactly 4→7→8', async ({ page }) => {
    await page.setContent(harnessHtml);
    await page.addScriptTag({ path: browserEntryPath, type: 'module' });

    const startedAtMs = 10_000;

    await renderAt(page, startedAtMs, startedAtMs);
    await expect(page.getByTestId('phase-label')).toHaveAttribute(
      'data-phase',
      'inhale'
    );
    await expect(page.getByTestId('phase-label')).toHaveAttribute(
      'data-phase-elapsed-ms',
      '0'
    );
    await expect(page.getByTestId('seconds-remaining')).toHaveText('4');

    await renderAt(page, startedAtMs, startedAtMs + 3_999);
    await expect(page.getByTestId('phase-label')).toHaveAttribute(
      'data-phase',
      'inhale'
    );
    await expect(page.getByTestId('seconds-remaining')).toHaveText('1');

    await renderAt(page, startedAtMs, startedAtMs + 4_000);
    await expect(page.getByTestId('phase-label')).toHaveAttribute(
      'data-phase',
      'hold'
    );
    await expect(page.getByTestId('phase-label')).toHaveAttribute(
      'data-phase-elapsed-ms',
      '0'
    );
    await expect(page.getByTestId('seconds-remaining')).toHaveText('7');

    await renderAt(page, startedAtMs, startedAtMs + 10_999);
    await expect(page.getByTestId('phase-label')).toHaveAttribute(
      'data-phase',
      'hold'
    );
    await expect(page.getByTestId('seconds-remaining')).toHaveText('1');

    await renderAt(page, startedAtMs, startedAtMs + 11_000);
    await expect(page.getByTestId('phase-label')).toHaveAttribute(
      'data-phase',
      'exhale'
    );
    await expect(page.getByTestId('phase-label')).toHaveAttribute(
      'data-phase-elapsed-ms',
      '0'
    );
    await expect(page.getByTestId('seconds-remaining')).toHaveText('8');

    await renderAt(page, startedAtMs, startedAtMs + 18_999);
    await expect(page.getByTestId('phase-label')).toHaveAttribute(
      'data-phase',
      'exhale'
    );
    await expect(page.getByTestId('seconds-remaining')).toHaveText('1');

    await renderAt(page, startedAtMs, startedAtMs + 19_000);
    await expect(page.getByTestId('phase-label')).toHaveAttribute(
      'data-phase',
      'inhale'
    );
    await expect(page.getByTestId('phase-label')).toHaveAttribute(
      'data-phase-elapsed-ms',
      '0'
    );
    await expect(page.getByTestId('cycle-label')).toHaveText('Cycle 2');
  });

  test('4-7-8 timer stays accurate after returning from a backgrounded tab', async ({
    page,
  }) => {
    await page.setContent(harnessHtml);
    await page.addScriptTag({ path: browserEntryPath, type: 'module' });

    const startedAtMs = 25_000;

    await renderAt(page, startedAtMs, startedAtMs + 3_000);
    await expect(page.getByTestId('phase-label')).toHaveAttribute(
      'data-phase',
      'inhale'
    );

    // Simulate a browser tab that stopped ticking while hidden: no renders happen
    // during the gap, then the UI recomputes from wall-clock elapsed time on return.
    await renderAt(page, startedAtMs, startedAtMs + 12_500);

    await expect(page.getByTestId('elapsed-ms')).toHaveText('12500');
    await expect(page.getByTestId('phase-label')).toHaveAttribute(
      'data-phase',
      'exhale'
    );
    await expect(page.getByTestId('phase-label')).toHaveAttribute(
      'data-phase-elapsed-ms',
      '1500'
    );
    await expect(page.getByTestId('seconds-remaining')).toHaveText('7');
  });
});

async function renderAt(
  page: Page,
  startedAtMs: number,
  nowMs: number
) {
  await page.evaluate(
    ({ startedAtMs: started, nowMs: now }) => {
      window.renderBreathworkSnapshot(started, now);
    },
    { startedAtMs, nowMs }
  );
}
