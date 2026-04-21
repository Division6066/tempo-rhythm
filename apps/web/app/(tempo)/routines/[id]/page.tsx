import { RoutineDetailScreen } from "@/components/tempo/screens/RoutineDetailScreen";

type PageProps = { params: Promise<{ id: string }> };

/**
 * @screen: routine-detail
 * @category: Library
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 42, §13
 * @source: docs/design/claude-export/design-system/screens-3.jsx (ScreenRoutineRun)
 * @summary: Guided routine execution with step progress, skip, pause.
 * @queries:
 *   - routines.byId
 *   - routines.listSteps
 * @mutations:
 *   - routines.logStepComplete
 *   - routines.skipStep
 *   - routines.pauseRun
 *   - routines.endRun
 * @auth: required
 */
export default async function RoutineDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <RoutineDetailScreen routineId={id} />;
}
