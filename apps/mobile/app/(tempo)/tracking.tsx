/**
 * @screen: tracking
 * @platform: mobile
 * @summary: Tracking chart leftover from #188. Sibling of today so the tab home stays put.
 */
import { TrackingDashboardChart } from "@/components/tracking/TrackingDashboardChart";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 gap-5">
        <Text className="text-2xl font-semibold text-foreground">Tracking</Text>
        <Text className="text-sm text-muted-foreground">
          Focus minutes from sessions you already logged. An empty chart is
          still a complete enough start.
        </Text>
        <TrackingDashboardChart sessions={[]} />
      </View>
    </SafeAreaView>
  );
}
