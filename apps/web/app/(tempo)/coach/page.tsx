import { CoachScreen } from "@/components/tempo/screens/CoachScreen";

/**
 * @screen: coach
 * @category: Flow
 * @owner: cursor-cloud-2
 * @prd: PRD §4 Screen 12, §8, §9
 * @source: docs/design/claude-export/design-system/screens-1.jsx + coach-dock.jsx
 * @summary: Persistent coach conversation with text + walkie-talkie input,
 * warmth dial, scope list, and accept/tweak/skip proposal cards.
 * @queries:
 *   - coach.messagesByConversation
 *   - coach.latestSuggestion
 *   - profiles.getVoiceUsageToday
 * @mutations:
 *   - coach.acceptSuggestion
 *   - coach.dismissSuggestion
 *   - profiles.setCoachDial
 * @actions:
 *   - coach.sendMessage
 *   - coach.requestRevision
 *   - voice.transcribePushToTalk
 * @providers:
 *   - openrouter (LLM + STT)
 * @schema-deltas:
 *   - voiceSessions.mode
 *   - profiles.coachDial
 * @tier-caps: basic 30 min/day, pro 90 min/day, max 180 min/day
 * @auth: required
 */
export default function CoachPage() {
  return <CoachScreen />;
}
