/**
 * @screen: coach
 * @category: Flow
 * @summary: Live AI coach chat via OpenRouter / Mistral.
 * @queries: (none)
 * @actions: coachActions.respond
 * @auth: required
 * @status: live
 * @notes: Ephemeral per-session history (React state only). Transcripts are
 *         not persisted here per HARD_RULES §6.1 — proposals live in a later
 *         ticket.
 */
import { CoachScreen } from "@/components/coach/CoachScreen";

export default function Page() {
  return <CoachScreen />;
}
