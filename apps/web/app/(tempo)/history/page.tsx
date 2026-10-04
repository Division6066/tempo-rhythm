/**
 * @screen: history
 * @category: You
 * @summary: Reopen past companion conversations.
 * @queries: conversations.list, conversations.get, messages.list
 * @mutations: (none)
 * @auth: required (gentle sign-in card otherwise)
 */
import { HistoryScreen } from "@/components/history/HistoryScreen";

export default function Page() {
  return <HistoryScreen />;
}
