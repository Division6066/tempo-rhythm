/**
 * @screen: settings-prefs
 * @category: Settings
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @queries: users.getPreferences
 * @mutations: users.setPreferences (theme, dyslexiaFont, reducedMotion)
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useState } from "react";
import { mockUser } from "@tempo/mock-data";
import { Button, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");
  const [theme, setTheme] = useState(mockUser.preferences.theme);
  const [dyslexia, setDyslexia] = useState(mockUser.preferences.dyslexiaFont);
  const [reduced, setReduced] = useState(mockUser.preferences.reducedMotion);

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-xl space-y-8 p-6 pb-24 md:p-8">
        <header>
          <p className="font-eyebrow text-muted-foreground">Settings</p>
          <h1 className="text-h1 font-serif text-foreground">Preferences</h1>
        </header>
        <SoftCard padding="md" className="space-y-6">
          <fieldset>
            <legend className="font-eyebrow text-muted-foreground">Theme</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["light", "dark", "system"] as const).map((t) => (
                <Button key={t} type="button" size="sm" variant={theme === t ? "primary" : "soft"} onClick={() => setTheme(t)}>
                  {t}
                </Button>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-3 text-body text-foreground">
            <input type="checkbox" checked={dyslexia} onChange={(e) => setDyslexia(e.target.checked)} className="h-4 w-4" />
            OpenDyslexic font
          </label>
          <label className="flex items-center gap-3 text-body text-foreground">
            <input type="checkbox" checked={reduced} onChange={(e) => setReduced(e.target.checked)} className="h-4 w-4" />
            Reduce motion
          </label>
          {/*
            @action savePreferences
            @mutation: users.setPreferences @index by_deletedAt
            @auth: required
            @errors: toast
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button type="button" variant="primary">
            Save preferences
          </Button>
        </SoftCard>
      </div>
    </ScreenSurface>
  );
}
