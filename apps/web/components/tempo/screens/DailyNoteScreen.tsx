"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, SoftCard } from "@tempo/ui/primitives";
import { useDemoToast } from "@/components/tempo/DemoToast";

const INITIAL = `Morning check-in — April 23

Energy: medium → high after walk.
Top three: Tempo post · PR review · dentist call.

Notes:
- If overwhelmed, open Brain Dump first.
- Shoulders-drop breath between blocks.`;

/**
 * DailyNoteScreen — distraction-free single-column daily page.
 * Bare layout (no sidebar).
 * @source docs/design/claude-export/design-system/screens-1.jsx (ScreenDailyNote)
 */
export function DailyNoteScreen() {
  const toast = useDemoToast();
  const [text, setText] = useState(INITIAL);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-10">
        <div className="flex items-center justify-between">
          <Link href="/today" className="font-eyebrow underline-offset-4 hover:underline">
            ← Today
          </Link>
          <div className="flex items-center gap-2">
            {/*
             * @behavior: Toggle focus mode (hide other surfaces entirely).
             * @convex-mutation-needed: profiles.toggleFocusMode
             */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast("Focus on. (demo) profiles.toggleFocusMode.")}
            >
              Focus mode
            </Button>
            {/*
             * @behavior: Save daily note.
             * @convex-mutation-needed: dailyNotes.save
             */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => toast("Saved. (demo) dailyNotes.save.")}
            >
              Save
            </Button>
          </div>
        </div>

        <SoftCard tone="default" padding="lg">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={18}
            className="w-full resize-y bg-transparent font-serif text-h4 leading-relaxed focus:outline-none"
            /*
             * @behavior: Persist daily note body; debounced save.
             * @convex-mutation-needed: dailyNotes.updateBody
             */
          />
        </SoftCard>

        <p className="text-center text-caption text-muted-foreground">
          Bare layout — no sidebar, no palette. Press ⌘/ at any time to jump.
        </p>
      </div>
    </div>
  );
}
