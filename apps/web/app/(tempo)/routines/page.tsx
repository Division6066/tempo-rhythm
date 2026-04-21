import { RoutinesScreen } from "@/components/tempo/screens/RoutinesScreen";

/**
 * @screen: routines
 * @category: Library
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 42, §13
 * @source: docs/design/claude-export/design-system/screens-3.jsx (ScreenRoutines)
 * @summary: Routine library with schedule + step count + start-now.
 * @queries:
 *   - routines.listAll
 * @mutations:
 *   - routines.createBlank
 *   - routines.startRun
 * @auth: required
 */
export default function RoutinesPage() {
  return <RoutinesScreen />;
}
