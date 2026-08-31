/**
 * @screen: analytics
 * @category: You
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 * @summary: Personal analytics & trends — read-only insights over tasks, habits, and goals.
 * @queries: analytics.insightsSummary
 * @mutations: (none)
 * @auth: required (gentle sign-in card otherwise)
 */
import { InsightsScreen } from "@/components/insights/InsightsScreen";

export default function Page() {
  return <InsightsScreen />;
}
