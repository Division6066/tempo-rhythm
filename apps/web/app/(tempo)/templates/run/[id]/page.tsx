import { TemplateRunScreen } from "@/components/tempo/screens/TemplateRunScreen";

type PageProps = { params: Promise<{ id: string }> };

/**
 * @screen: template-run
 * @category: You
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 23, §10
 * @source: docs/design/claude-export/design-system/screens-template-run.jsx
 * @summary: Guided template run with step progress, skip, cancel.
 * @queries:
 *   - templates.byId
 * @mutations:
 *   - templates.logStepComplete
 *   - templates.skipStep
 *   - templates.abandonRun
 *   - templates.endRun
 * @auth: required
 */
export default async function TemplateRunPage({ params }: PageProps) {
  const { id } = await params;
  return <TemplateRunScreen templateId={id} />;
}
