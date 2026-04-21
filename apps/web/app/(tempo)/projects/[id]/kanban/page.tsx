import { ProjectKanbanScreen } from "@/components/tempo/screens/ProjectKanbanScreen";

type PageProps = { params: Promise<{ id: string }> };

/**
 * @screen: project-kanban
 * @category: Library
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 18, §12
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 * @summary: Four-lane kanban board for a single project. Advance cards via
 * right-arrow button in demo mode; drag will be wired with dnd-kit later.
 * @queries:
 *   - projects.byId
 *   - kanban.listCardsForProject
 * @mutations:
 *   - kanban.moveCard
 * @auth: required
 */
export default async function ProjectKanbanPage({ params }: PageProps) {
  const { id } = await params;
  return <ProjectKanbanScreen projectId={id} />;
}
