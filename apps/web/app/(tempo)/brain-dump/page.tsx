import { BrainDumpScreen } from "@/components/tempo/screens/BrainDumpScreen";

/**
 * @screen: brain-dump
 * @category: Flow
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 11, §6
 * @source: docs/design/claude-export/design-system/screens-1.jsx (ScreenBrainDump)
 * @summary: Low-friction thought capture + AI extraction. Accept/reject preview
 * keeps raw content in memory until the user approves.
 * @queries:
 *   - brainDumps.listRecent
 * @mutations:
 *   - brainDumps.acceptProposal
 *   - brainDumps.discardProposal
 *   - brainDumps.acceptAllProposals
 * @actions:
 *   - brainDumps.processCapture
 *   - voice.transcribeWalkieTalkie
 * @providers:
 *   - openrouter (extraction + STT)
 * @auth: required
 * @notes: Raw dump text is RAM-only per HARD_RULES §3.
 */
export default function BrainDumpPage() {
  return <BrainDumpScreen />;
}
