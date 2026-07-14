import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BreatheScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 gap-3">
        <Text className="text-2xl font-semibold text-foreground">Breathe</Text>
        <Text className="text-sm text-muted-foreground">
          A quiet pause for a slower breath.
        </Text>
      </View>
    </SafeAreaView>
  );
}
