import { HabitDetailScreen } from "@/components/tempo/screens/HabitDetailScreen";

type PageProps = { params: Promise<{ id: string }> };

/**
 * @screen: habit-detail
 * @category: Library
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 14, §12
 * @source: docs/design/claude-export/design-system/screens-3.jsx (ScreenHabitDetail)
 * @summary: Habit deep-dive with streak, 28-day heatmap, settings, notes.
 * @queries:
 *   - habits.byId
 *   - habits.completionsLast28Days
 * @mutations:
 *   - habits.logCompletion
 *   - habits.undoCompletion
 *   - habits.snoozeToday
 *   - habits.updateSettings
 * @auth: required
 */
export default async function HabitDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <HabitDetailScreen habitId={id} />;
}
