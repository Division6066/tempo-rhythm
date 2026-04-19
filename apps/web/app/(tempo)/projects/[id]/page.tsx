/**
 * @generated-by: T-F004 scaffold — replace with T-F005* port.
 * @screen: project-detail
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 * @summary: Project detail with tasks + notes.
 * @queries: projects.get, projects.tasks
 * @mutations: projects.update
 * @auth: required
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

type Params = { id: string };

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  return (
    <ScaffoldScreen
      title="Project detail"
      category="Library"
      source="screens-4.jsx"
      summary={`Project detail with tasks + notes. (id: ${id})`}
    />
  );
}
