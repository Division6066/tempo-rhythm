"use client";

import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { ProfileReady } from "@/components/today/ProfileReady";
import { NagList } from "@/components/nags/NagList";
import { NagPhraseEditor } from "@/components/nag-phrases/NagPhraseEditor";

export function NagsScreen() {
  const [nagId, setNagId] = useState<Id<"nags"> | null>(null);
  return (
    <div data-testid="settings-nags" className="flex flex-col gap-8">
      <ProfileReady>
        <NagList onSelect={setNagId} />
        {nagId ? <NagPhraseEditor key={nagId} nagId={nagId} /> : null}
      </ProfileReady>
    </div>
  );
}
