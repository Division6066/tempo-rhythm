export type LoggedTrackingSession = {
  id: string;
  loggedAt: number;
  focusMinutes: number;
};

export type TrackingDashboardPoint = {
  id: string;
  loggedAt: number;
  isoDate: string;
  focusMinutes: number;
  x: number;
  y: number;
};

type ChartDimensions = {
  width: number;
  height: number;
  padding: number;
};

const defaultDimensions: ChartDimensions = {
  width: 280,
  height: 128,
  padding: 16,
};

const roundChartCoordinate = (value: number) => Math.round(value * 100) / 100;

export function buildTrackingDashboardPoints(
  sessions: ReadonlyArray<LoggedTrackingSession>,
  dimensions: Partial<ChartDimensions> = {}
): TrackingDashboardPoint[] {
  if (sessions.length === 0) {
    return [];
  }

  const chart = { ...defaultDimensions, ...dimensions };
  const drawableWidth = Math.max(chart.width - chart.padding * 2, 1);
  const drawableHeight = Math.max(chart.height - chart.padding * 2, 1);
  const orderedSessions = [...sessions].sort(
    (left, right) => left.loggedAt - right.loggedAt
  );
  const largestFocusMinutes = Math.max(
    ...orderedSessions.map((session) => session.focusMinutes),
    1
  );
  const lastIndex = Math.max(orderedSessions.length - 1, 1);

  return orderedSessions.map((session, index) => {
    const x =
      orderedSessions.length === 1
        ? chart.width / 2
        : chart.padding + (index / lastIndex) * drawableWidth;
    const y =
      chart.height -
      chart.padding -
      (session.focusMinutes / largestFocusMinutes) * drawableHeight;

    return {
      id: session.id,
      loggedAt: session.loggedAt,
      isoDate: new Date(session.loggedAt).toISOString(),
      focusMinutes: session.focusMinutes,
      x: roundChartCoordinate(x),
      y: roundChartCoordinate(y),
    };
  });
}
