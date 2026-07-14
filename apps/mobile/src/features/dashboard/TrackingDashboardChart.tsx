import { tempoColors } from '@tempo/ui/theme';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import {
  buildTrackingDashboardPoints,
  type LoggedTrackingSession,
} from './tracking-dashboard-data';

type TrackingDashboardChartProps = {
  sessions: ReadonlyArray<LoggedTrackingSession>;
};

const chartWidth = 280;
const chartHeight = 128;
const chartPadding = 16;

export function TrackingDashboardChart({
  sessions,
}: TrackingDashboardChartProps) {
  const points = buildTrackingDashboardPoints(sessions, {
    width: chartWidth,
    height: chartHeight,
    padding: chartPadding,
  });
  const polylinePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(' ');
  const sessionWord = points.length === 1 ? 'session' : 'sessions';

  return (
    <View className="rounded-3xl border border-border bg-card p-5 gap-4">
      <View className="gap-1">
        <Text className="text-lg font-semibold text-foreground">
          Tracking dashboard
        </Text>
        <Text className="text-sm text-muted-foreground">
          Focus minutes from logged sessions only.
        </Text>
      </View>

      {points.length > 0 ? (
        <View
          accessible={true}
          accessibilityLabel={`Focus chart with ${points.length} logged ${sessionWord}.`}
          className="items-center"
        >
          <Svg
            height={chartHeight}
            testID="tracking-dashboard-chart"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            width={chartWidth}
          >
            <Line
              stroke={tempoColors.lineSoft}
              strokeWidth={1}
              x1={chartPadding}
              x2={chartWidth - chartPadding}
              y1={chartHeight - chartPadding}
              y2={chartHeight - chartPadding}
            />
            {polylinePoints ? (
              <Polyline
                fill="none"
                points={polylinePoints}
                stroke={tempoColors.tempoOrange}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
              />
            ) : null}
            {points.map((point) => (
              <Circle
                cx={point.x}
                cy={point.y}
                fill={tempoColors.tempoOrange}
                key={point.id}
                r={5}
                stroke={tempoColors.creamRaised}
                strokeWidth={2}
                testID={`tracking-dashboard-point-${point.id}`}
              />
            ))}
          </Svg>
          <Text className="text-xs text-muted-foreground">
            {points.length} logged {sessionWord}
          </Text>
        </View>
      ) : (
        <View
          accessible={true}
          accessibilityLabel="No logged tracking sessions yet."
          className="rounded-2xl border border-dashed border-border bg-muted/30 p-4"
        >
          <Text className="text-sm text-muted-foreground">
            No logged sessions yet. Your chart will appear after you save one.
          </Text>
        </View>
      )}
    </View>
  );
}
