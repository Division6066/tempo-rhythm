/**
 * @screen: breathwork
 * @platform: mobile
 * @summary: Named breath-pattern leftover from #183. Sibling of routines so the 4-7-8 timer stays put.
 */
import { BreathworkTimer } from "@/components/breathwork/BreathworkTimer";
import {
  getNamedBreathPattern,
  isNamedBreathPatternId,
  namedBreathPatternIds,
  namedBreathPatterns,
  type NamedBreathPatternId,
} from "@/lib/breathwork-patterns";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  const params = useLocalSearchParams<{ pattern?: string }>();
  const initialId = isNamedBreathPatternId(params.pattern)
    ? params.pattern
    : "4-7-8";
  const [patternId, setPatternId] = useState<NamedBreathPatternId>(initialId);
  const selected = getNamedBreathPattern(patternId);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 gap-5">
        <View className="gap-2">
          <Text className="text-2xl font-semibold text-foreground">
            Breathwork
          </Text>
          <Text className="text-sm text-muted-foreground">
            Patterns live in config. Adding another one does not change the
            timer.
          </Text>
        </View>

        <View className="gap-2">
          {namedBreathPatternIds.map((id) => {
            const option = namedBreathPatterns[id];
            const selectedOption = id === patternId;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: selectedOption }}
                key={id}
                onPress={() => setPatternId(id)}
              >
                <Text
                  className={
                    selectedOption
                      ? "text-base font-semibold text-foreground"
                      : "text-base text-muted-foreground"
                  }
                >
                  {option.name}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {option.description}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <BreathworkTimer key={patternId} pattern={selected.pattern} />
      </View>
    </SafeAreaView>
  );
}
