import { ProjectDetailScreen } from "@/components/tempo/screens/ProjectDetailScreen";

type PageProps = { params: Promise<{ id: string }> };

/**
 * @screen: project-detail
 * @category: Library
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 18, §13
 * @source: docs/design/claude-export/design-system/screens-4.jsx (ScreenProjectDetail)
 * @summary: Project tabs: tasks, notes, timeline.
 * @queries:
 *   - projects.byId
 *   - projects.listTasks
 *   - projects.listNotes
 *   - projects.timeline
 * @mutations:
 *   - tasks.complete
 * @auth: required
 */
export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ProjectDetailScreen projectId={id} />;
}
