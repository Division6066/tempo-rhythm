import { AskFounderScreen } from "@/components/tempo/screens/AskFounderScreen";

/**
 * @screen: ask-founder
 * @category: Settings
 * @owner: cursor-cloud-3
 * @prd: PRD §14
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @summary: Direct message form to the founder inbox.
 * @mutations:
 *   - founderInbox.createDraft
 *   - founderInbox.updateDraft
 * @actions:
 *   - founderInbox.sendMessage
 * @auth: required
 */
export default function AskFounderPage() {
  return <AskFounderScreen />;
}
