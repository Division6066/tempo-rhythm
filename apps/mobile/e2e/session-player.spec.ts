import { expect, test } from '@playwright/test';

test('play-pause-resume', async ({ page }) => {
  await page.goto('/routines/focus-reset');

  const startButton = page.getByRole('button', { name: 'Start routine' });
  await expect(startButton).toBeVisible();

  await startButton.click();
  await expect(page.getByTestId('session-player-state')).toHaveText('Playing');

  await expect(page.getByTestId('session-player-step')).toHaveText(
    'Settle in'
  );
  await page.getByRole('button', { name: 'Pause routine' }).click();
  await expect(page.getByTestId('session-player-state')).toHaveText('Paused');
  await expect(page.getByRole('button', { name: 'Resume routine' })).toBeVisible();

  await page.getByRole('button', { name: 'Resume routine' }).click();
  await expect(page.getByTestId('session-player-state')).toHaveText('Playing');

  await expect(page.getByTestId('session-player-step')).toHaveText('Finish');
  await expect(page.getByTestId('session-player-state')).toHaveText('Finished');
});
