import { TodayScreen } from "@/components/tempo/screens/TodayScreen";

/**
 * @screen: today
 * @category: Flow
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 1, §8, §14
 * @source: docs/design/claude-export/design-system/screens-1.jsx (ScreenToday)
 * @summary: Daily command center with coach guidance, top priorities, habits,
 * up-next list, and an energy check-in. Demo-wired with @tempo/mock-data.
 * @queries:
 *   - tasks.listToday
 *   - calendar.listToday
 *   - coach.latestSuggestion
 *   - habits.listDaily
 *   - plans.getTodayPlan
 * @mutations:
 *   - tasks.complete
 *   - tasks.rescheduleToToday
 *   - plans.setEnergyCheckIn
 *   - coach.dismissSuggestion
 * @auth: required
 * @notes: Copy is Claude placeholder; a later copy pass will refine.
 */
export default function TodayPage() {
  return <TodayScreen />;
}
