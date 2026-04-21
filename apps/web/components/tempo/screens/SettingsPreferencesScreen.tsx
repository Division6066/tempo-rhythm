"use client";

import { useState } from "react";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

/**
 * SettingsPreferencesScreen — notifications, focus mode, theme.
 * @source docs/design/claude-export/design-system/screens-6.jsx
 */
export function SettingsPreferencesScreen() {
  const toast = useDemoToast();
  const [dailyReminders, setDailyReminders] = useState(true);
  const [coachNudges, setCoachNudges] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");
  const [quietHoursStart, setStart] = useState("21:00");
  const [quietHoursEnd, setEnd] = useState("08:30");

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Settings"
        title="Preferences"
        lede="How Tempo talks to you, and when."
      />

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-2">
        <SoftCard tone="default" padding="md">
          <h3 className="mb-3 font-serif text-h4">Notifications</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-lg bg-surface-sunken p-3">
              <div>
                <div className="text-small">Daily plan reminder</div>
                <div className="text-caption text-muted-foreground">
                  One gentle push around your first active hour.
                </div>
              </div>
              {/*
               * @behavior: Toggle daily reminder notification.
               * @convex-mutation-needed: profiles.setNotificationPreference
               */}
              <Button
                variant={dailyReminders ? "primary" : "soft"}
                size="sm"
                onClick={() => setDailyReminders((v) => !v)}
              >
                {dailyReminders ? "On" : "Off"}
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-surface-sunken p-3">
              <div>
                <div className="text-small">Coach nudges</div>
                <div className="text-caption text-muted-foreground">
                  Coach can remind you about staged tasks that went cold.
                </div>
              </div>
              {/*
               * @behavior: Toggle coach proactive nudges.
               * @convex-mutation-needed: profiles.setCoachNudges
               */}
              <Button
                variant={coachNudges ? "primary" : "soft"}
                size="sm"
                onClick={() => setCoachNudges((v) => !v)}
              >
                {coachNudges ? "On" : "Off"}
              </Button>
            </div>

            <div className="rounded-lg bg-surface-sunken p-3">
              <div className="text-small">Quiet hours</div>
              <div className="text-caption text-muted-foreground">
                No pushes, no pings. Coach still listens.
              </div>
              <div className="mt-3 flex items-center gap-3">
                <label className="flex items-center gap-2 text-caption">
                  <span>from</span>
                  <input
                    type="time"
                    value={quietHoursStart}
                    onChange={(e) => setStart(e.target.value)}
                    className="rounded-lg border border-border-soft bg-card px-2 py-1"
                    /*
                     * @behavior: Set quiet-hours start.
                     * @convex-mutation-needed: profiles.setQuietHours
                     */
                  />
                </label>
                <label className="flex items-center gap-2 text-caption">
                  <span>to</span>
                  <input
                    type="time"
                    value={quietHoursEnd}
                    onChange={(e) => setEnd(e.target.value)}
                    className="rounded-lg border border-border-soft bg-card px-2 py-1"
                  />
                </label>
              </div>
            </div>
          </div>
        </SoftCard>

        <SoftCard tone="default" padding="md">
          <h3 className="mb-3 font-serif text-h4">Appearance</h3>
          <div className="flex flex-col gap-3">
            <div className="rounded-lg bg-surface-sunken p-3">
              <div className="text-small">Theme</div>
              <div className="text-caption text-muted-foreground">
                Auto follows your system preference.
              </div>
              <div className="mt-3 flex gap-2">
                {(["light", "dark", "auto"] as const).map((t) => (
                  /*
                   * @behavior: Persist theme preference; re-renders root.
                   * @convex-mutation-needed: profiles.setThemePreference
                   */
                  <Button
                    key={t}
                    variant={theme === t ? "primary" : "subtle"}
                    size="sm"
                    onClick={() => setTheme(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-surface-sunken p-3">
              <div className="text-small">Scope chips in coach</div>
              <div className="text-caption text-muted-foreground">
                Show a chip when a response uses retrieved context.
              </div>
              <div className="mt-3">
                <Pill tone="moss">on</Pill>
              </div>
            </div>

            <div className="flex items-center justify-end">
              {/*
               * @behavior: Persist all preferences in one round-trip.
               * @convex-mutation-needed: profiles.savePreferences
               */}
              <Button
                variant="primary"
                size="md"
                onClick={() => toast("Saved. (demo) profiles.savePreferences.")}
              >
                Save preferences
              </Button>
            </div>
          </div>
        </SoftCard>
      </div>
    </div>
  );
}
