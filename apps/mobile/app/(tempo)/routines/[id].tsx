import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SessionPlayer, type RoutineStep } from '@/components/SessionPlayer';

const focusResetSteps: RoutineStep[] = [
  { id: 'settle-in', title: 'Settle in', durationMs: 30_000 },
  { id: 'breathe', title: 'Breathe', durationMs: 600 },
  { id: 'finish', title: 'Finish', durationMs: 600 },
];

const routinesById: Record<string, { title: string; steps: RoutineStep[] }> = {
  'focus-reset': {
    title: 'Focus reset',
    steps: focusResetSteps,
  },
};

export default function RoutineSessionScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const routine = routinesById[id ?? ''] ?? routinesById['focus-reset'];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <SessionPlayer steps={routine.steps} title={routine.title} />
    </SafeAreaView>
  );
}
