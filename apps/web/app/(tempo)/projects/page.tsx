import { ProjectsScreen } from "@/components/tempo/screens/ProjectsScreen";

/**
 * @screen: projects
 * @category: Library
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 17, §12
 * @source: docs/design/claude-export/design-system/screens-4.jsx (ScreenProjects)
 * @summary: Project index with color chip, due date, and kanban link.
 * @queries:
 *   - projects.listAll
 * @mutations:
 *   - projects.create
 * @auth: required
 */
export default function ProjectsPage() {
  return <ProjectsScreen />;
}
