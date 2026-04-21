import { InsightsScreen } from "@/components/tempo/screens/InsightsScreen";

/**
 * @screen: analytics
 * @category: You
 * @owner: cursor-cloud-2
 * @prd: PRD §4 Screen 43, §17
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 * @summary: Analytics dashboard with weekly completion, focus time, habit
 * adherence, energy histogram, and gentle-not-shaming flags.
 * @queries:
 *   - analytics.tasksCompletedByDay
 *   - analytics.focusTimeByWeek
 *   - analytics.habitAdherenceThisMonth
 *   - analytics.energyHistogram
 * @auth: required
 */
export default function InsightsPage() {
  return <InsightsScreen />;
}
