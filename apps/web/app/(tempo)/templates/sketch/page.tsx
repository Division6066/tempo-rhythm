import { TemplateSketchScreen } from "@/components/tempo/screens/TemplateSketchScreen";

/**
 * @screen: template-sketch
 * @category: You
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 23, §10
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 * @summary: Upload a hand sketch and preview AI-parsed template structure.
 * @actions:
 *   - templates.parseSketch
 *   - templates.createFromSketch
 * @providers:
 *   - openrouter (vision)
 * @auth: required
 */
export default function TemplateSketchPage() {
  return <TemplateSketchScreen />;
}
