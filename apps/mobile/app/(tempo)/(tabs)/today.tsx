import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TrackingDashboardChart } from '@/src/features/dashboard/TrackingDashboardChart';
import type { LoggedTrackingSession } from '@/src/features/dashboard/tracking-dashboard-data';

const loggedTrackingSessions: LoggedTrackingSession[] = [];

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 gap-5">
        <Text className="text-2xl font-semibold text-foreground">Today</Text>
        <Text className="text-sm text-muted-foreground">
          Start with what you have. Logged tracking sessions will shape the
          dashboard as they arrive.
        </Text>
        <TrackingDashboardChart sessions={loggedTrackingSessions} />
      </View>
    </SafeAreaView>
  );
}
