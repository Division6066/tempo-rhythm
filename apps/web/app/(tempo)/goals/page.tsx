import { GoalsScreen } from "@/components/tempo/screens/GoalsScreen";

/**
 * @screen: goals
 * @category: Library
 * @owner: cursor-cloud-2
 * @prd: PRD §4 Screen 15, §7
 * @source: docs/design/claude-export/design-system/screens-4.jsx (ScreenGoals)
 * @summary: Goals index with progress rings and coach-assisted decomposition.
 * @queries:
 *   - goals.listAll
 * @mutations:
 *   - goals.create
 * @actions:
 *   - goals.coachDecompose
 * @providers:
 *   - openrouter
 * @auth: required
 */
export default function GoalsPage() {
  return <GoalsScreen />;
}
