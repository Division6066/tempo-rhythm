import { HabitsScreen } from "@/components/tempo/screens/HabitsScreen";

/**
 * @screen: habits
 * @category: Library
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 14, §12
 * @source: docs/design/claude-export/design-system/screens-3.jsx (ScreenHabits)
 * @summary: Habit library with streak rings + quick check-in.
 * @queries:
 *   - habits.listAll
 *   - habits.getTodayChecks
 * @mutations:
 *   - habits.logCompletion
 *   - habits.undoCompletion
 *   - habits.createHabit
 * @auth: required
 */
export default function HabitsPage() {
  return <HabitsScreen />;
}
