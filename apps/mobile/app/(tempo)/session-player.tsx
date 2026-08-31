/**
 * @screen: session-player
 * @platform: mobile
 * @summary: Session player leftover from #187. Sibling of routines so BreathworkTimer stays put.
 */
import { SessionPlayer } from "@/components/session-player/SessionPlayer";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 gap-5">
        <Text className="text-2xl font-semibold text-foreground">Session player</Text>
        <Text className="text-sm text-muted-foreground">
          A short loop you can start, pause, and finish. Coming back later is
          still a complete enough day.
        </Text>
        <SessionPlayer />
      </View>
    </SafeAreaView>
  );
}
