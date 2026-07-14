import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BreathworkTimer } from '@/components/BreathworkTimer';
import {
  type BreathPatternId,
  breathPatterns,
} from '@/lib/breathwork/patterns';

function isBreathPatternId(
  value: string | undefined
): value is BreathPatternId {
  return value !== undefined && value in breathPatterns;
}

function parseLoops(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export default function BreathworkScreen() {
  const params = useLocalSearchParams<{
    autoplay?: string;
    loops?: string;
    pattern?: string;
  }>();
  const patternId = isBreathPatternId(params.pattern)
    ? params.pattern
    : '4-7-8';
  const pattern = breathPatterns[patternId];
  const loops = parseLoops(params.loops, pattern.defaultLoops);
  const autoStart = params.autoplay === '1';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="gap-5 p-6">
        <View className="gap-2">
          <Text className="text-3xl font-semibold text-foreground">
            Breathwork
          </Text>
          <Text className="text-base text-muted-foreground">
            A calm, phase-driven timer. Patterns live in config, so adding a new
            routine does not change timer logic.
          </Text>
        </View>

        <BreathworkTimer
          autoStart={autoStart}
          loops={loops}
          patternId={patternId}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
