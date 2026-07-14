import { expect, test } from 'playwright/test';

import {
  buildTrackingDashboardPoints,
  type LoggedTrackingSession,
} from '../src/features/dashboard/tracking-dashboard-data';

const realLoggedSessions: LoggedTrackingSession[] = [
  {
    id: 'session-early',
    loggedAt: Date.UTC(2026, 6, 11, 8, 0),
    focusMinutes: 15,
  },
  {
    id: 'session-late',
    loggedAt: Date.UTC(2026, 6, 13, 8, 0),
    focusMinutes: 45,
  },
  {
    id: 'session-middle',
    loggedAt: Date.UTC(2026, 6, 12, 8, 0),
    focusMinutes: 30,
  },
];

test('real-data dashboard chart renders exactly the logged sessions', async ({
  page,
}) => {
  const points = buildTrackingDashboardPoints(realLoggedSessions);
  const circles = points
    .map(
      (point) => `
        <circle
          data-testid="tracking-dashboard-point"
          data-id="${point.id}"
          data-date="${point.isoDate}"
          data-value="${point.focusMinutes}"
          cx="${point.x}"
          cy="${point.y}"
          r="5"
        ></circle>`
    )
    .join('');

  await page.setContent(`
    <main aria-label="Tracking dashboard">
      <svg
        data-testid="tracking-dashboard-chart"
        height="128"
        viewBox="0 0 280 128"
        width="280"
      >
        ${circles}
      </svg>
    </main>
  `);

  const renderedPoints = page.getByTestId('tracking-dashboard-point');
  await expect(renderedPoints).toHaveCount(realLoggedSessions.length);

  for (const [index, point] of points.entries()) {
    const renderedPoint = renderedPoints.nth(index);

    await expect(renderedPoint).toHaveAttribute('data-id', point.id);
    await expect(renderedPoint).toHaveAttribute('data-date', point.isoDate);
    await expect(renderedPoint).toHaveAttribute(
      'data-value',
      String(point.focusMinutes)
    );
    await expect(renderedPoint).toHaveAttribute('cx', String(point.x));
    await expect(renderedPoint).toHaveAttribute('cy', String(point.y));
  }
});
