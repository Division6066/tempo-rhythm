import { KanjiRomajiPair } from "@tempo/ui/native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ThemeTokensScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-6 p-6">
        <View className="gap-2">
          <Text className="text-2xl font-semibold text-foreground">Theme tokens</Text>
          <Text className="text-sm text-muted-foreground">
            A small mobile sample screen for Edo-inspired typography pairs.
          </Text>
        </View>

        <View className="items-start">
          <KanjiRomajiPair kanji="道" label="Kanji do, the way" romaji="do" />
        </View>
      </View>
    </SafeAreaView>
  );
}
