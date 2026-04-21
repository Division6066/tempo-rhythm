import { TemplateEditorScreen } from "@/components/tempo/screens/TemplateEditorScreen";

type PageProps = { params: Promise<{ id: string }> };

/**
 * @screen: template-editor
 * @category: You
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 23, §10
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 * @summary: Lightweight editor for title/summary/section list of existing
 * template. Full structural edits happen in /templates/builder.
 * @queries:
 *   - templates.byId
 *   - templates.listSections
 * @mutations:
 *   - templates.renameTitle
 *   - templates.updateSummary
 *   - templates.addSection
 *   - templates.saveEditorChanges
 * @auth: required
 */
export default async function TemplateEditorPage({ params }: PageProps) {
  const { id } = await params;
  return <TemplateEditorScreen templateId={id} />;
}
