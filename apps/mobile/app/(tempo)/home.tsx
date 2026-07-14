import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 gap-3">
        <Text className="text-2xl font-semibold text-foreground">Home</Text>
        <Text className="text-sm text-muted-foreground">
          A soft starting point for the next kind step.
        </Text>
      </View>
    </SafeAreaView>
  );
}
