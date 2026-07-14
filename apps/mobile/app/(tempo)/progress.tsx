import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProgressScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 gap-3">
        <Text className="text-2xl font-semibold text-foreground">Progress</Text>
        <Text className="text-sm text-muted-foreground">
          Small signals that something is moving.
        </Text>
      </View>
    </SafeAreaView>
  );
}
