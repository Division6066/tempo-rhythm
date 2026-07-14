import { TrackingDashboard } from "@/components/TrackingDashboard";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <TrackingDashboard />
    </SafeAreaView>
  );
}
