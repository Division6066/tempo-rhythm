/**
 * @screen: settings-memory
 * @category: Settings
 * @summary: See and manage what Tempo remembers.
 * @auth: required
 */
import { MemoryManager } from "@/components/memory/MemoryManager";

export default function Page() {
  return (
    <div data-testid="settings-memory">
      <MemoryManager />
    </div>
  );
}
