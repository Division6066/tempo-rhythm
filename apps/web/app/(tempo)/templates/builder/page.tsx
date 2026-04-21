import { TemplateBuilderScreen } from "@/components/tempo/screens/TemplateBuilderScreen";

/**
 * @screen: template-builder
 * @category: You
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 23, §10
 * @source: docs/design/claude-export/design-system/screens-template-builder*.jsx
 * @summary: Builder with canvas + inspector + slash commands for AI-assisted
 * template authoring.
 * @queries:
 *   - templates.blockById
 * @mutations:
 *   - templates.addBlock
 *   - templates.updateBlock
 *   - templates.deleteBlock
 *   - templates.saveDraft
 * @auth: required
 */
export default function TemplateBuilderPage() {
  return <TemplateBuilderScreen />;
}
