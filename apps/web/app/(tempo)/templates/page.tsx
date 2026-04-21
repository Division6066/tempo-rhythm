import { TemplatesScreen } from "@/components/tempo/screens/TemplatesScreen";

/**
 * @screen: templates
 * @category: You
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 22, §10
 * @source: docs/design/claude-export/design-system/screens-templates.jsx
 * @summary: Template gallery with type eyebrow, method badge, use/edit actions.
 * @queries:
 *   - templates.listAll
 * @mutations:
 *   - templates.startRun
 * @actions:
 *   - templates.parseSketch
 * @providers:
 *   - openrouter
 * @auth: required
 */
export default function TemplatesPage() {
  return <TemplatesScreen />;
}
