/**
 * @screen: session-player
 * @platform: mobile
 * @summary: Session player leftover from #187. Sibling of routines so BreathworkTimer stays put.
 */

import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SessionPlayer } from '@/components/session-player/SessionPlayer';
import {
  getGuidedMovementRoutineById,
  guidedMovementToSession,
} from '@/lib/movement-routines';
import { seededRoutines } from '@/lib/session-player';

export default function Screen() {
  const params = useLocalSearchParams<{ routine?: string }>();
  const guided =
    typeof params.routine === 'string'
      ? getGuidedMovementRoutineById(params.routine)
      : undefined;
  const routine = guided ? guidedMovementToSession(guided) : seededRoutines[0];

  if (!routine) {
    throw new Error('Expected a session routine');
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 gap-5">
        <Text className="text-2xl font-semibold text-foreground">
          Session player
        </Text>
        <Text className="text-sm text-muted-foreground">
          A short loop you can start, pause, and finish. Coming back later is
          still a complete enough day.
        </Text>
        <SessionPlayer routine={routine} />
      </View>
    </SafeAreaView>
  );
}
