import { GoalsProgressScreen } from "@/components/tempo/screens/GoalsProgressScreen";

/**
 * @screen: goals-progress
 * @category: Library
 * @owner: cursor-cloud-2
 * @prd: PRD §4 Screen 15, §17
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 * @summary: Goals progress chart with click-through to individual goal detail.
 * @queries:
 *   - goals.progressSeries
 * @actions:
 *   - goals.exportProgressSnapshot
 * @auth: required
 */
export default function GoalsProgressPage() {
  return <GoalsProgressScreen />;
}
